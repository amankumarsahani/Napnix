/**
 * Tracks when a trial-ending reminder email was last sent, so
 * workers/planLifecycleWorker.js doesn't re-send one every tick.
 */
module.exports = async function (connection) {
    const alterations = [
        { col: 'trial_reminder_sent_at', sql: 'ADD COLUMN trial_reminder_sent_at DATETIME DEFAULT NULL AFTER trial_ends_at' },
    ];
    for (const { col, sql } of alterations) {
        try { await connection.query(`ALTER TABLE tenants ${sql}`); }
        catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }
};
