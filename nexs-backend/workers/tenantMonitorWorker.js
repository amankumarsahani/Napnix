/**
 * Tenant Monitor Worker
 *
 * Nothing re-checked a tenant after provisioning: tenant /health always said OK and
 * `tenants.process_status` was only written at start/stop, so an outage or an attack
 * was found by the customer. This worker polls every live tenant (pull model, same
 * INTERNAL_OAUTH_KEY as planConfigSync/legal-docs):
 *
 *  - every tick (60s): GET /api/internal/health/deep (falls back to /health on
 *    tenants that predate it) → tenant_health_checks + tenant_monitor_state,
 *    down/recovered alerts, metric rules (5xx spike, 4xx scanning, memory, slow).
 *  - every 5 min: `pm2 jlist` per server (crash loop, status mismatch) and the
 *    tenant's last-hour security log → security rules (brute force, credential
 *    stuffing, privilege escalation, mass delete/export, new admin country).
 *  - once a day: prune + digest email of open medium/low events.
 *
 * Rules are pure functions in services/tenantMonitorRules.js. Alerts: email for
 * high/critical only, everything visible in the admin panel.
 * PRD: nexcrm-backend/docs/PRD_tenant_monitoring.md
 */

const axios = require('axios');
const dns = require('dns').promises;
const geoip = require('geoip-lite');
const { promisify } = require('util');
const { exec, execFile } = require('child_process');
const { pool } = require('../config/database');
const emailService = require('../services/email.service');
const businessClock = require('../utils/businessClock');
const Rules = require('../services/tenantMonitorRules');

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

const INTERNAL_OAUTH_KEY = process.env.INTERNAL_OAUTH_KEY;
const CRM_DOMAIN = process.env.NEXCRM_DOMAIN || 'napnix.in';
// e.g. "http://127.0.0.1:{port}" for on-prem/local; default is the public API host
// so tunnel/DNS breakage counts as down, which is what the customer would see.
const API_URL_TEMPLATE = process.env.TENANT_MONITOR_API_URL_TEMPLATE || `https://{slug}-crm-api.${CRM_DOMAIN}`;
const HTTP_TIMEOUT_MS = 5000;
const CONCURRENCY = 8;
const SLOW_INTERVAL_MS = 5 * 60 * 1000;
const HEALTH_RETENTION_DAYS = 7;
const EVENT_RETENTION_DAYS = 180;
const DOWN_REPEAT_MIN = 60;
const DIGEST_HOUR_IST = 9;
const PM2_MAX_BUFFER = 64 * 1024 * 1024; // jlist includes every process env
const SERVER_METRICS_RETENTION_DAYS = 30;
// Resolved before every tick to tell "this host lost DNS" apart from "tenants are down".
const DNS_PROBE_HOSTS = (process.env.MONITOR_DNS_PROBE_HOSTS || 'one.one.one.one,dns.google').split(',').map(s => s.trim()).filter(Boolean);
const DNS_PROBE_TIMEOUT_MS = 3000;
const LOCAL_API_URL_TEMPLATE = 'http://127.0.0.1:{port}';
const ALERT_RETRY_MIN = 5;           // failed alert emails are retried this often
const ALERT_RETRY_WINDOW_HOURS = 6;  // ...for this long after the event first fired
// Host metrics + PM2 in one SSH round trip; parsed by Rules.parseHostSample.
const HOST_SAMPLE_COMMAND = [
    'cat /proc/loadavg',
    'nproc',
    "free -m | awk '/^Mem:/{print $2, $3}'",
    'df -BG --output=size,used / | tail -1',
    'echo __PM2__',
    'pm2 jlist'
].join('; ');

const ADMIN_URL = () => (process.env.ADMIN_PANEL_URL || 'https://admin.napnix.in').replace(/\/+$/, '');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function recipients() {
    if (process.env.MONITOR_ALERT_EMAILS) {
        return process.env.MONITOR_ALERT_EMAILS.split(',').map(s => s.trim()).filter(Boolean);
    }
    const list = emailService.getNotificationRecipients?.() || [];
    if (list.length) return list;
    return [process.env.NAPNIX_ADMIN_EMAIL || 'admin@napnix.in'];
}

function tenantApiUrl(tenant, template = API_URL_TEMPLATE) {
    return template.replace('{slug}', tenant.slug).replace('{port}', tenant.assigned_port);
}

async function resolvesWithin(host, ms) {
    try {
        await Promise.race([dns.lookup(host), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
        return true;
    } catch {
        return false;
    }
}

async function mapLimit(items, limit, fn) {
    let i = 0;
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (i < items.length) {
            const item = items[i++];
            try { await fn(item); } catch (err) { console.error('[TenantMonitor] task failed:', err.message); }
        }
    });
    await Promise.all(runners);
}

class TenantMonitorWorker {
    constructor() {
        this.isRunning = false;
        this.lastSlowRun = 0;
        this.lastDailyKey = null;
        this.latencies = new Map(); // tenantId -> recent latencies (ms)
        this.alertAttempts = new Map(); // alert key -> last send attempt (ms), for retry pacing
    }

    /** True when an alert email for `key` may be (re)tried now. */
    attemptDue(key) {
        const last = this.alertAttempts.get(key) || 0;
        if (Date.now() - last < ALERT_RETRY_MIN * 60000) return false;
        if (this.alertAttempts.size > 5000) this.alertAttempts.clear();
        this.alertAttempts.set(key, Date.now());
        return true;
    }

    start(intervalMs = 60000) {
        if (!INTERNAL_OAUTH_KEY) {
            console.warn('[TenantMonitor] INTERNAL_OAUTH_KEY not set — deep health and security feed will be unavailable');
        }
        this.tick().catch(err => console.error('[TenantMonitor] Initial tick failed:', err));
        setInterval(() => {
            this.tick().catch(err => console.error('[TenantMonitor] Tick failed:', err));
        }, intervalMs);
        console.log('[TenantMonitor] Started');
    }

    async tick() {
        if (this.isRunning) return; // a slow cycle (many tenants, slow SSH) skips the next tick
        this.isRunning = true;
        try {
            const tenants = await this.loadTenants();
            if (tenants === null) return;

            // If this host cannot resolve DNS, every public-URL probe fails and all tenants
            // would be marked down while customers (who come in through the tunnel) are fine.
            // Check same-box tenants on their local port instead and skip the rest.
            const dnsOk = (await Promise.all(DNS_PROBE_HOSTS.map(h => resolvesWithin(h, DNS_PROBE_TIMEOUT_MS)))).some(Boolean);
            let bases;
            if (dnsOk) {
                bases = new Map(tenants.map(t => [t.id, tenantApiUrl(t)]));
            } else {
                const [servers] = await pool.query('SELECT id, is_primary FROM servers WHERE is_active = 1');
                const primaryIds = new Set(servers.filter(s => s.is_primary).map(s => s.id));
                const local = tenants.filter(t => t.server_id === null || primaryIds.has(t.server_id));
                bases = new Map(local.map(t => [t.id, tenantApiUrl(t, LOCAL_API_URL_TEMPLATE)]));
                await this.recordHit({
                    category: 'health',
                    hit: {
                        rule: 'monitor_dns_failure', severity: 'high', subject: '',
                        summary: `Monitor host cannot resolve DNS — outbound email/API calls from it will fail; ${local.length} local tenants checked on 127.0.0.1, ${tenants.length - local.length} skipped`,
                        details: { probe_hosts: DNS_PROBE_HOSTS, local_tenants: local.length, skipped_tenants: tenants.length - local.length }
                    }
                });
            }
            const reachable = tenants.filter(t => bases.has(t.id));

            await mapLimit(reachable, CONCURRENCY, t => this.checkHealth(t, bases.get(t.id)));

            if (Date.now() - this.lastSlowRun >= SLOW_INTERVAL_MS) {
                this.lastSlowRun = Date.now();
                await this.checkPm2(tenants);
                await mapLimit(reachable, CONCURRENCY, t => this.checkSecurity(t, bases.get(t.id)));
            }

            await this.retryUnsentAlerts();
            await this.daily();
        } finally {
            this.isRunning = false;
        }
    }

    async loadTenants() {
        try {
            const [rows] = await pool.query(`
                SELECT t.id, t.name, t.slug, t.assigned_port, t.process_name, t.process_status, t.server_id,
                       s.health AS prev_health, s.consecutive_failures, s.last_down_alert_at, s.pm2_restarts,
                       -- Computed by the DB: node (America/New_York) and DB clocks may differ.
                       TIMESTAMPDIFF(MINUTE, s.last_down_alert_at, NOW()) AS mins_since_down_alert
                FROM tenants t
                LEFT JOIN tenant_monitor_state s ON s.tenant_id = t.id
                WHERE t.status IN ('trial', 'active')
                  AND t.process_status IN ('running', 'error')
            `);
            return rows;
        } catch (err) {
            if (err.code === 'ER_NO_SUCH_TABLE') {
                if (!this.warnedMissing) console.warn('[TenantMonitor] monitoring tables missing — run migration 069');
                this.warnedMissing = true;
                return null;
            }
            throw err;
        }
    }

    // ── Health ────────────────────────────────────────────────────────────

    async probe(tenant, base = tenantApiUrl(tenant)) {
        const opts = { timeout: HTTP_TIMEOUT_MS, validateStatus: () => true };
        const t0 = Date.now();
        try {
            let res = await axios.get(`${base}/api/internal/health/deep`, { ...opts, headers: { 'X-Internal-Key': INTERNAL_OAUTH_KEY || '' } });
            // Tenant built before deep health existed (404) or key mismatch (403): plain liveness.
            if (res.status === 404 || res.status === 403) {
                res = await axios.get(`${base}/health`, opts);
            }
            const latency = Date.now() - t0;
            const body = res.data && typeof res.data === 'object' ? res.data : {};
            // Old /health has no `db` field; treat a 200 from it as DB-unknown, not failure.
            const dbOk = body.db === undefined ? null : body.db === 'ok';
            return {
                ok: res.status === 200 && dbOk !== false,
                http_status: res.status,
                latency_ms: latency,
                db_ok: dbOk,
                deep: body.counters ? body : null,
                error: res.status === 200 ? null : `HTTP ${res.status}`
            };
        } catch (err) {
            return { ok: false, http_status: null, latency_ms: null, db_ok: null, deep: null, error: (err.code || err.message || 'error').slice(0, 255) };
        }
    }

    async checkHealth(tenant, base) {
        const r = await this.probe(tenant, base);

        await pool.query(
            `INSERT INTO tenant_health_checks
                (tenant_id, ok, http_status, latency_ms, db_ok, error, db_latency_ms, memory_rss_mb, requests_5m, errors_4xx_5m, errors_5xx_5m)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tenant.id, r.ok ? 1 : 0, r.http_status, r.latency_ms, r.db_ok === null ? null : (r.db_ok ? 1 : 0), r.error,
                r.deep?.db_latency_ms ?? null, r.deep?.memory_rss_mb ?? null, r.deep?.counters?.requests ?? null,
                r.deep?.counters?.errors_4xx ?? null, r.deep?.counters?.errors_5xx ?? null
            ]
        );

        const prev = { health: tenant.prev_health || 'unknown', consecutive_failures: tenant.consecutive_failures || 0 };
        const next = Rules.nextHealthState(prev, r.ok);

        await pool.query(`
            INSERT INTO tenant_monitor_state
                (tenant_id, health, consecutive_failures, last_ok_at, last_check_at, last_latency_ms, last_error, memory_rss_mb, errors_5xx_5m, errors_4xx_5m)
            VALUES (?, ?, ?, ${r.ok ? 'NOW()' : 'NULL'}, NOW(), ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                health = VALUES(health), consecutive_failures = VALUES(consecutive_failures),
                last_ok_at = ${r.ok ? 'NOW()' : 'last_ok_at'}, last_check_at = NOW(),
                last_latency_ms = VALUES(last_latency_ms), last_error = VALUES(last_error),
                memory_rss_mb = COALESCE(VALUES(memory_rss_mb), memory_rss_mb),
                errors_5xx_5m = COALESCE(VALUES(errors_5xx_5m), errors_5xx_5m),
                errors_4xx_5m = COALESCE(VALUES(errors_4xx_5m), errors_4xx_5m)
        `, [
            tenant.id, next.health, next.consecutive_failures, r.latency_ms, r.error,
            r.deep?.memory_rss_mb ?? null, r.deep?.counters?.errors_5xx ?? null, r.deep?.counters?.errors_4xx ?? null
        ]);

        await this.handleTransition(tenant, next, r);

        if (r.ok) {
            const list = this.latencies.get(tenant.id) || [];
            list.push(r.latency_ms);
            this.latencies.set(tenant.id, list.slice(-10));
            const hits = Rules.evaluateHealthMetrics({
                counters: r.deep?.counters,
                memory_rss_mb: r.deep?.memory_rss_mb,
                latencies: this.latencies.get(tenant.id)
            });
            for (const hit of hits) await this.recordHit({ tenant, category: 'health', hit });
        }
    }

    async handleTransition(tenant, next, r) {
        const dbDown = r.db_ok === false;
        const rule = dbDown ? 'db_unreachable' : 'tenant_down';

        if (next.health === 'down') {
            const due = next.transition === 'down'
                || tenant.mins_since_down_alert === null || tenant.mins_since_down_alert >= DOWN_REPEAT_MIN;
            const hit = {
                rule, severity: 'high', subject: '',
                summary: dbDown
                    ? `Database unreachable (${next.consecutive_failures} failed checks)`
                    : `Tenant down — ${next.consecutive_failures} failed checks (${r.error || 'no response'})`,
                details: { consecutive_failures: next.consecutive_failures, last_error: r.error, http_status: r.http_status }
            };
            // Down alerts repeat hourly while down, so they bypass recordHit's once-per-row email.
            // last_down_alert_at only moves on a successful send; a failed send retries every
            // ALERT_RETRY_MIN instead of going quiet for an hour.
            await this.recordHit({ tenant, category: 'health', hit, email: false });
            if (due && this.attemptDue(`down:${tenant.id}`) && await this.sendAlert(tenant, hit)) {
                await pool.query('UPDATE tenant_monitor_state SET last_down_alert_at = NOW() WHERE tenant_id = ?', [tenant.id]);
            }
        } else if (next.transition === 'recovered') {
            const hit = { rule: 'tenant_recovered', severity: 'info', subject: '', summary: `Tenant recovered (health check OK, ${r.latency_ms} ms)`, details: { latency_ms: r.latency_ms } };
            await this.recordHit({ tenant, category: 'health', hit, email: false });
            if (tenant.last_down_alert_at) await this.sendAlert(tenant, hit);
            await pool.query('UPDATE tenant_monitor_state SET last_down_alert_at = NULL WHERE tenant_id = ?', [tenant.id]);
        }
    }

    // ── PM2 ───────────────────────────────────────────────────────────────

    async runOnServer(server, command) {
        const opts = { maxBuffer: PM2_MAX_BUFFER, timeout: 30000 };
        if (server.is_primary) return execAsync(command, opts);
        const target = server.hostname.includes('@') || !server.ssh_user ? server.hostname : `${server.ssh_user}@${server.hostname}`;
        return execFileAsync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', target, command], opts);
    }

    async checkPm2(tenants) {
        const [servers] = await pool.query('SELECT id, name, hostname, ssh_user, is_primary FROM servers WHERE is_active = 1');
        const primary = servers.find(s => s.is_primary) || { id: null, name: 'primary', is_primary: true };
        // Every active server is sampled (host metrics for the dashboard), even with no live tenants.
        const byServer = new Map([[primary, []], ...servers.map(s => [s, []])]);
        for (const t of tenants) {
            const server = servers.find(s => s.id === t.server_id) || primary;
            if (!byServer.has(server)) byServer.set(server, []);
            byServer.get(server).push(t);
        }

        for (const [server, list] of byServer) {
            let procs;
            try {
                const { stdout } = await this.runOnServer(server, HOST_SAMPLE_COMMAND);
                const sample = Rules.parseHostSample(stdout);
                procs = sample.procs;
                await pool.query(`
                    INSERT INTO server_metrics
                        (server_id, server_name, load1, load5, load15, cpu_count, mem_total_mb, mem_used_mb, disk_total_gb, disk_used_gb, processes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    server.id ?? null, server.name, ...sample.host.load, sample.host.cpu_count,
                    sample.host.mem_total_mb, sample.host.mem_used_mb, sample.host.disk_total_gb, sample.host.disk_used_gb,
                    JSON.stringify(Rules.summarizeProcesses(procs))
                ]).catch(err => console.error('[TenantMonitor] server_metrics insert failed:', err.message));
            } catch (err) {
                await this.recordHit({
                    server, category: 'health',
                    hit: { rule: 'server_unreachable', severity: 'high', subject: '', summary: `Could not read PM2 on server ${server.name}: ${String(err.message).replace(/\s+/g, ' ').slice(0, 120)}`, details: { tenants: list.length } }
                });
                continue;
            }

            const byName = new Map(procs.map(p => [p.name, p]));
            for (const tenant of list) {
                const proc = byName.get(tenant.process_name) || null;
                const hits = Rules.evaluatePm2(tenant, proc, tenant.pm2_restarts);
                for (const hit of hits) await this.recordHit({ tenant, category: 'health', hit });
                await pool.query(`
                    UPDATE tenant_monitor_state
                    SET pm2_status = ?, pm2_restarts = ?, pm2_memory_mb = ?, pm2_checked_at = NOW()
                    WHERE tenant_id = ?
                `, [
                    proc ? proc.pm2_env?.status : 'missing',
                    proc ? Number(proc.pm2_env?.restart_time || 0) : null,
                    proc ? Math.round((proc.monit?.memory || 0) / 1048576) : null,
                    tenant.id
                ]);
            }
        }
    }

    // ── Security ──────────────────────────────────────────────────────────

    async checkSecurity(tenant, base = tenantApiUrl(tenant)) {
        let feed = 'ok';
        let events = [];
        try {
            const res = await axios.get(`${base}/api/internal/security-events`, {
                params: { minutes: 60 },
                headers: { 'X-Internal-Key': INTERNAL_OAUTH_KEY || '' },
                timeout: 15000,
                validateStatus: () => true
            });
            if (res.status === 404) feed = 'unsupported'; // route or table not there yet: migrate the tenant
            else if (res.status !== 200 || !Array.isArray(res.data?.events)) feed = 'error';
            else events = res.data.events;
        } catch (err) {
            feed = 'error';
        }

        await pool.query(`
            UPDATE tenant_monitor_state
            SET security_feed = ?, security_checked_at = NOW()${feed === 'ok' ? ', security_ok_at = NOW()' : ''}
            WHERE tenant_id = ?
        `, [feed, tenant.id]);

        if (feed === 'error') {
            // Only a gap while the tenant is otherwise healthy is interesting; down is alerted already.
            const [[state]] = await pool.query(
                `SELECT health, security_ok_at < NOW() - INTERVAL 30 MINUTE AS stale, security_ok_at IS NULL AS never
                 FROM tenant_monitor_state WHERE tenant_id = ?`, [tenant.id]);
            if (state && state.health === 'up' && (state.stale || state.never)) {
                await this.recordHit({ tenant, category: 'security', hit: { rule: 'security_feed_gap', severity: 'medium', subject: '', summary: 'Security log has not been readable for 30+ min while the tenant is up', details: {} } });
            }
            return;
        }
        if (feed !== 'ok') return;

        for (const hit of Rules.evaluateSecurity(events)) {
            await this.recordHit({ tenant, category: 'security', hit });
        }
        await this.checkAdminCountries(tenant, events);
    }

    async checkAdminCountries(tenant, events) {
        // Oldest first, so a user's first-ever login sets the baseline before later ones are compared.
        const logins = Rules.privilegedLogins(events).sort((a, b) => b.age_s - a.age_s);
        for (const e of logins) {
            const country = geoip.lookup(e.ip)?.country;
            if (!country) continue;
            const [known] = await pool.query(
                'SELECT country FROM tenant_login_countries WHERE tenant_id = ? AND user_id = ? AND last_seen_at > NOW() - INTERVAL 30 DAY',
                [tenant.id, e.user_id]
            );
            const isNew = known.length > 0 && !known.some(k => k.country === country);
            await pool.query(`
                INSERT INTO tenant_login_countries (tenant_id, user_id, country) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE last_seen_at = NOW()
            `, [tenant.id, e.user_id, country]);
            if (isNew) {
                await this.recordHit({
                    tenant, category: 'security',
                    hit: {
                        rule: 'admin_new_country', severity: 'medium', subject: `user:${e.user_id}:${country}`,
                        summary: `${Rules.maskEmail(e.email)} (${Rules.parseMeta(e.meta).role}) logged in from ${country}, not seen in 30 days`,
                        details: { account: Rules.maskEmail(e.email), country, previous: known.map(k => k.country), ip: Rules.maskIp(e.ip) }
                    }
                });
            }
        }
    }

    // ── Persistence + alerts ──────────────────────────────────────────────

    /**
     * Insert a rule hit, or fold it into the same (tenant/server, rule, subject) row
     * seen within the cooldown. New high/critical rows email once.
     */
    async recordHit({ tenant = null, server = null, category, hit, email = true }) {
        const tenantId = tenant ? tenant.id : null;
        const serverId = tenant ? null : (server?.id ?? null);
        const details = JSON.stringify(hit.details || {});

        const [existing] = await pool.query(`
            SELECT id FROM tenant_monitor_events
            WHERE tenant_id <=> ? AND server_id <=> ? AND rule = ? AND subject = ?
              AND last_seen_at > NOW() - INTERVAL ? MINUTE
            ORDER BY id DESC LIMIT 1
        `, [tenantId, serverId, hit.rule, hit.subject || '', Rules.COOLDOWN_MIN]);

        if (existing.length) {
            await pool.query(`
                UPDATE tenant_monitor_events
                SET last_seen_at = NOW(), occurrences = occurrences + 1, summary = ?, details = ?, severity = ?
                WHERE id = ?
            `, [hit.summary.slice(0, 255), details, hit.severity, existing[0].id]);
            return;
        }

        const [result] = await pool.query(`
            INSERT INTO tenant_monitor_events (tenant_id, server_id, category, rule, subject, severity, summary, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [tenantId, serverId, category, hit.rule, hit.subject || '', hit.severity, hit.summary.slice(0, 255), details]);

        if (email && (hit.severity === 'high' || hit.severity === 'critical')) {
            this.alertAttempts.set(`event:${result.insertId}`, Date.now());
            const sent = await this.sendAlert(tenant || { name: `Server ${server?.name || 'monitor'}`, slug: server?.name || 'monitor' }, hit);
            if (sent) await pool.query('UPDATE tenant_monitor_events SET emailed_at = NOW() WHERE id = ?', [result.insertId]);
            // unsent rows are picked up by retryUnsentAlerts()
        }
    }

    /** Resend high/critical alerts whose email failed (SMTP or DNS down), for a few hours. */
    async retryUnsentAlerts() {
        const [rows] = await pool.query(`
            SELECT e.id, e.rule, e.severity, e.summary, e.details, e.tenant_id,
                   t.name AS tenant_name, t.slug AS tenant_slug, sv.name AS server_name
            FROM tenant_monitor_events e
            LEFT JOIN tenants t ON t.id = e.tenant_id
            LEFT JOIN servers sv ON sv.id = e.server_id
            WHERE e.emailed_at IS NULL AND e.acknowledged_at IS NULL
              AND e.severity IN ('high', 'critical')
              AND e.rule NOT IN ('tenant_down', 'db_unreachable')
              AND e.first_seen_at > NOW() - INTERVAL ? HOUR
            ORDER BY e.id
            LIMIT 10
        `, [ALERT_RETRY_WINDOW_HOURS]);
        for (const row of rows) {
            if (!this.attemptDue(`event:${row.id}`)) continue;
            const target = row.tenant_id
                ? { id: row.tenant_id, name: row.tenant_name, slug: row.tenant_slug }
                : { name: `Server ${row.server_name || 'monitor'}`, slug: row.server_name || 'monitor' };
            let details = row.details;
            if (typeof details === 'string') { try { details = JSON.parse(details); } catch { details = {}; } }
            const hit = { rule: row.rule, severity: row.severity, summary: `${row.summary} (delayed alert)`, details };
            if (await this.sendAlert(target, hit)) {
                await pool.query('UPDATE tenant_monitor_events SET emailed_at = NOW() WHERE id = ?', [row.id]);
            }
        }
    }

    async sendAlert(tenant, hit) {
        const level = hit.severity.toUpperCase();
        const link = tenant.id ? `${ADMIN_URL()}/tenants/${tenant.id}?tab=monitoring` : `${ADMIN_URL()}/system/tenant-health`;
        const rows = Object.entries(hit.details || {})
            .filter(([, v]) => v !== null && v !== undefined && v !== '')
            .map(([k, v]) => `<tr><td style="padding:3px 12px 3px 0;color:#64748b;font-size:13px;">${esc(k)}</td><td style="padding:3px 0;font-size:13px;">${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</td></tr>`)
            .join('');
        try {
            const result = await emailService.sendEmail({
                to: recipients(),
                subject: `[NapCRM][${level}] ${tenant.slug} — ${hit.summary}`.slice(0, 200),
                html: `
                <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;">
                    <h2 style="margin:0 0 4px;font-size:16px;">${esc(tenant.name)} <span style="color:#64748b;font-weight:400;">(${esc(tenant.slug)})</span></h2>
                    <p style="margin:0 0 12px;font-size:14px;"><strong>${esc(level)}</strong> · ${esc(hit.rule)}<br>${esc(hit.summary)}</p>
                    <table>${rows}</table>
                    <p style="margin-top:16px;"><a href="${esc(link)}">Open in admin panel</a></p>
                </div>`
            });
            return Boolean(result?.success);
        } catch (err) {
            console.error('[TenantMonitor] alert email failed:', err.message);
            return false;
        }
    }

    // ── Daily housekeeping ────────────────────────────────────────────────

    async daily() {
        const key = businessClock.today();
        const hourIst = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: businessClock.ZONE }).format(new Date()));
        if (this.lastDailyKey === key || hourIst < DIGEST_HOUR_IST) return;
        this.lastDailyKey = key;

        await pool.query('DELETE FROM tenant_health_checks WHERE checked_at < NOW() - INTERVAL ? DAY', [HEALTH_RETENTION_DAYS]);
        await pool.query('DELETE FROM tenant_monitor_events WHERE last_seen_at < NOW() - INTERVAL ? DAY', [EVENT_RETENTION_DAYS]);
        await pool.query('DELETE FROM tenant_login_countries WHERE last_seen_at < NOW() - INTERVAL 90 DAY');
        await pool.query('DELETE FROM server_metrics WHERE checked_at < NOW() - INTERVAL ? DAY', [SERVER_METRICS_RETENTION_DAYS]);

        const [open] = await pool.query(`
            SELECT e.severity, e.rule, e.summary, e.occurrences, t.slug
            FROM tenant_monitor_events e LEFT JOIN tenants t ON t.id = e.tenant_id
            WHERE e.acknowledged_at IS NULL AND e.severity IN ('low', 'medium')
              AND e.last_seen_at > NOW() - INTERVAL 1 DAY
            ORDER BY FIELD(e.severity, 'medium', 'low'), e.last_seen_at DESC
            LIMIT 50
        `);
        const [unhealthy] = await pool.query(`
            SELECT t.slug, s.health FROM tenant_monitor_state s JOIN tenants t ON t.id = s.tenant_id
            WHERE s.health IN ('down', 'degraded') AND t.status IN ('trial', 'active')
        `);
        if (!open.length && !unhealthy.length) return;

        const li = (s) => `<li style="font-size:13px;margin:2px 0;">${s}</li>`;
        await emailService.sendEmail({
            to: recipients(),
            subject: `[NapCRM] Daily monitor digest — ${open.length} open events, ${unhealthy.length} unhealthy tenants`,
            html: `
            <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                ${unhealthy.length ? `<h3 style="font-size:15px;">Unhealthy tenants</h3><ul>${unhealthy.map(u => li(`${esc(u.slug)} — ${esc(u.health)}`)).join('')}</ul>` : ''}
                ${open.length ? `<h3 style="font-size:15px;">Open medium/low events (24 h)</h3><ul>${open.map(o => li(`[${esc(o.severity)}] ${esc(o.slug || 'server')} · ${esc(o.rule)} — ${esc(o.summary)}${o.occurrences > 1 ? ` (×${o.occurrences})` : ''}`)).join('')}</ul>` : ''}
                <p><a href="${esc(ADMIN_URL())}/system/tenant-health">Open tenant health</a></p>
            </div>`
        }).catch(err => console.error('[TenantMonitor] digest failed:', err.message));
    }
}

module.exports = new TenantMonitorWorker();
