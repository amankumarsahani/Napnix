/**
 * Backup Worker
 * Handles automated daily backups
 */

const BackupService = require('../services/backup.service');

class BackupWorker {
    constructor() {
        this.isRunning = false;
        this.lastScheduledDateKey = null;
    }

    parseScheduleTime(scheduleTime) {
        const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(scheduleTime || '').trim());
        if (!match) {
            return { hour: 2, minute: 0, label: '02:00' };
        }

        return {
            hour: Number(match[1]),
            minute: Number(match[2]),
            label: `${match[1].padStart(2, '0')}:${match[2]}`
        };
    }

    getTimeParts(date, timeZone) {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(date).reduce((acc, part) => {
            if (part.type !== 'literal') {
                acc[part.type] = part.value;
            }
            return acc;
        }, {});

        return {
            dateKey: `${parts.year}-${parts.month}-${parts.day}`,
            hour: Number(parts.hour),
            minute: Number(parts.minute)
        };
    }

    hasReachedSchedule(nowParts, schedule) {
        return nowParts.hour > schedule.hour || (nowParts.hour === schedule.hour && nowParts.minute >= schedule.minute);
    }

    /**
     * Start the worker
     */
    start(intervalMs = 60000) {
        console.log('[BackupWorker] Starting...');

        this.checkSchedule().catch((error) => {
            console.error('[BackupWorker] Initial schedule check failed:', error);
        });

        setInterval(() => {
            this.checkSchedule().catch((error) => {
                console.error('[BackupWorker] Scheduled check failed:', error);
            });
        }, intervalMs);
    }

    /**
     * Check if it's time to run backup
     */
    async checkSchedule() {
        if (this.isRunning) return;

        const { scheduleTime, timezone, lastSuccessAt } = await BackupService.getScheduleConfig();
        const schedule = this.parseScheduleTime(scheduleTime);
        const nowParts = this.getTimeParts(new Date(), timezone);

        if (!this.hasReachedSchedule(nowParts, schedule)) {
            return;
        }

        if (this.lastScheduledDateKey === nowParts.dateKey) {
            return;
        }

        if (lastSuccessAt) {
            const lastSuccessDate = new Date(lastSuccessAt);
            if (!Number.isNaN(lastSuccessDate.getTime())) {
                const lastSuccessParts = this.getTimeParts(lastSuccessDate, timezone);
                if (lastSuccessParts.dateKey === nowParts.dateKey) {
                    this.lastScheduledDateKey = nowParts.dateKey;
                    return;
                }
            }
        }

        this.lastScheduledDateKey = nowParts.dateKey;
        await this.runBackup({
            reason: 'scheduled',
            scheduleContext: {
                schedule: schedule.label,
                timezone,
                dateKey: nowParts.dateKey
            }
        });
    }

    /**
     * Run the backup process
     */
    async runBackup(options = {}) {
        const { reason = 'scheduled', scheduleContext = null } = options;

        if (this.isRunning) {
            console.log('[BackupWorker] Backup already in progress, skipping schedule.');
            return;
        }

        this.isRunning = true;

        try {
            const contextSuffix = scheduleContext
                ? ` (${scheduleContext.schedule} ${scheduleContext.timezone} on ${scheduleContext.dateKey})`
                : '';
            console.log(`[BackupWorker] Starting ${reason} backup run${contextSuffix}...`);
            await BackupService.backupAllTenants();

            if (reason === 'scheduled') {
                await BackupService.markScheduledRunSuccess(new Date().toISOString());
            }

            console.log('[BackupWorker] Daily backup completed successfully.');
        } catch (error) {
            console.error('[BackupWorker] Daily backup failed:', error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Manual Trigger (exposed for API)
     */
    async triggerNow() {
        if (this.isRunning) {
            throw new Error('Backup is already in progress');
        }

        this.runBackup({ reason: 'manual' }).catch(err => console.error('[BackupWorker] Manual run error:', err));
        return true;
    }
}

module.exports = new BackupWorker();
