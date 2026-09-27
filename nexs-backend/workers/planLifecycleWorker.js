/**
 * Plan Lifecycle Worker
 *
 * Nothing currently checks `trial_ends_at` — a trial tenant runs forever
 * until someone notices and suspends it by hand. This worker closes that gap:
 *
 *  - 3 days before trial end and not yet on a paid plan: reminder email.
 *  - trial end passed and still on `status = 'trial'`: suspend + stop the
 *    tenant's PM2 process (same shape as the payment-failure suspend path in
 *    webhook.controller.js).
 *
 * Ticks every 60s (same interval as backupWorker/workflowWorker) but only
 * acts once per tenant per day, tracked by `lastScheduledDateKey` the same
 * way backupWorker debounces its own daily run.
 *
 * Usage-threshold warnings (80% of a plan limit) are deliberately NOT in this
 * pass — that needs per-tenant-DB queries across every industry's tables and
 * is a separate, bigger piece of work. See docs/PRD_plan_enforcement.md §4.5.
 */

const { pool } = require('../config/database');
const TenantModel = require('../models/tenant.model');
const Provisioner = require('../services/provisioner');
const emailService = require('../services/email.service');

const REMINDER_WINDOW_DAYS = 3;

class PlanLifecycleWorker {
    constructor() {
        this.isRunning = false;
        this.lastRunDateKey = null;
    }

    todayKey() {
        return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC is fine for a once/day gate
    }

    start(intervalMs = 60000) {
        this.tick().catch(err => console.error('[PlanLifecycleWorker] Initial tick failed:', err));
        setInterval(() => {
            this.tick().catch(err => console.error('[PlanLifecycleWorker] Tick failed:', err));
        }, intervalMs);
        console.log('[PlanLifecycleWorker] Started');
    }

    async tick() {
        const todayKey = this.todayKey();
        if (this.isRunning || this.lastRunDateKey === todayKey) return;

        this.isRunning = true;
        try {
            await this.sendTrialReminders();
            await this.suspendExpiredTrials();
            this.lastRunDateKey = todayKey;
        } finally {
            this.isRunning = false;
        }
    }

    async sendTrialReminders() {
        const [tenants] = await pool.query(`
            SELECT id, name, email, slug, trial_ends_at
            FROM tenants
            WHERE status = 'trial'
              AND trial_ends_at IS NOT NULL
              AND trial_ends_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
              AND (trial_reminder_sent_at IS NULL OR DATE(trial_reminder_sent_at) != CURDATE())
        `, [REMINDER_WINDOW_DAYS]).catch(err => {
            // trial_reminder_sent_at may not exist yet on a DB that hasn't run the
            // companion migration — degrade to "always eligible" rather than crash
            // the worker loop, and log once so it's visible in ops.
            console.warn('[PlanLifecycleWorker] trial_reminder_sent_at column missing, add it via migration:', err.message);
            return [[]];
        });

        for (const tenant of tenants) {
            if (!tenant.email) continue;
            try {
                const daysLeft = Math.max(0, Math.ceil((new Date(tenant.trial_ends_at) - Date.now()) / 86400000));
                await emailService.sendEmail({
                    to: tenant.email,
                    subject: `Your NapCRM trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
                    html: `<p>Hi ${tenant.name || 'there'},</p>
                           <p>Your NapCRM trial for <strong>${tenant.slug}</strong> ends on
                           ${new Date(tenant.trial_ends_at).toDateString()}. Upgrade to a paid plan
                           to keep your data and team active without interruption.</p>`
                });
                await pool.query('UPDATE tenants SET trial_reminder_sent_at = NOW() WHERE id = ?', [tenant.id]);
                console.log(`[PlanLifecycleWorker] Trial reminder sent to tenant ${tenant.slug}`);
            } catch (err) {
                console.error(`[PlanLifecycleWorker] Reminder failed for tenant ${tenant.slug}:`, err.message);
            }
        }
    }

    async suspendExpiredTrials() {
        const [expired] = await pool.query(`
            SELECT id, slug FROM tenants
            WHERE status = 'trial' AND trial_ends_at IS NOT NULL AND trial_ends_at < NOW()
        `);

        for (const row of expired) {
            try {
                const tenant = await TenantModel.findById(row.id);
                if (!tenant) continue;

                await TenantModel.update(row.id, { status: 'suspended' });

                if (tenant.process_status === 'running') {
                    const provisioner = new Provisioner();
                    await provisioner.stopProcess(tenant);
                    await TenantModel.updateProcessStatus(row.id, 'stopped');
                }

                console.log(`[PlanLifecycleWorker] Suspended expired trial: ${row.slug}`);
            } catch (err) {
                console.error(`[PlanLifecycleWorker] Failed to suspend expired trial ${row.slug}:`, err.message);
            }
        }
    }
}

module.exports = new PlanLifecycleWorker();
