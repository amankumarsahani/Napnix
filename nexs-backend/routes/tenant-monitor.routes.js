// Tenant health + security monitoring for the admin panel. Mounted under the
// admin router (auth + isAdmin). Data is written by workers/tenantMonitorWorker.js.
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

const SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];

const parseJson = (v) => {
    if (v === null || v === undefined || typeof v === 'object') return v;
    try { return JSON.parse(v); } catch { return null; }
};

// ── GET /overview — one row per live tenant, worst first ──────────────────
router.get('/overview', async (req, res) => {
    try {
        const [rows] = await query(`
            SELECT t.id, t.name, t.slug, t.status, t.process_status, t.industry_type,
                   COALESCE(s.health, 'unknown') AS health, s.consecutive_failures, s.last_ok_at, s.last_check_at,
                   s.last_latency_ms, s.last_error, s.memory_rss_mb, s.errors_5xx_5m, s.errors_4xx_5m,
                   s.pm2_status, s.pm2_restarts, s.pm2_memory_mb, s.pm2_checked_at,
                   COALESCE(s.security_feed, 'unknown') AS security_feed, s.security_ok_at,
                   (SELECT COUNT(*) FROM tenant_monitor_events e
                     WHERE e.tenant_id = t.id AND e.acknowledged_at IS NULL AND e.severity IN ('medium','high','critical')) AS open_events,
                   (SELECT ROUND(100 * AVG(c.ok), 2) FROM tenant_health_checks c
                     WHERE c.tenant_id = t.id AND c.checked_at > NOW() - INTERVAL 24 HOUR) AS uptime_24h
            FROM tenants t
            LEFT JOIN tenant_monitor_state s ON s.tenant_id = t.id
            WHERE t.status IN ('trial', 'active')
            ORDER BY FIELD(COALESCE(s.health, 'unknown'), 'down', 'degraded', 'unknown', 'up'), open_events DESC, t.name
        `);
        const summary = rows.reduce((acc, r) => {
            acc[r.health] = (acc[r.health] || 0) + 1;
            acc.open_events += Number(r.open_events) || 0;
            return acc;
        }, { up: 0, degraded: 0, down: 0, unknown: 0, open_events: 0 });
        res.json({ success: true, summary, tenants: rows });
    } catch (error) {
        console.error('[TenantMonitor] overview failed:', error);
        res.status(500).json({ error: 'Failed to load tenant health' });
    }
});

// ── GET /tenants/:id/checks?hours=24 — latency/uptime series ──────────────
router.get('/tenants/:id/checks', async (req, res) => {
    try {
        const hours = Math.min(168, Math.max(1, parseInt(req.query.hours, 10) || 24));
        const [checks] = await query(`
            SELECT checked_at, ok, http_status, latency_ms, db_ok, error
            FROM tenant_health_checks
            WHERE tenant_id = ? AND checked_at > NOW() - INTERVAL ? HOUR
            ORDER BY checked_at ASC
        `, [req.params.id, hours]);
        const [[state]] = await query('SELECT * FROM tenant_monitor_state WHERE tenant_id = ?', [req.params.id]);
        res.json({ success: true, state: state || null, checks });
    } catch (error) {
        console.error('[TenantMonitor] checks failed:', error);
        res.status(500).json({ error: 'Failed to load health checks' });
    }
});

// ── GET /events?tenantId=&category=&severity=&rule=&open=1&page=&limit= ──
router.get('/events', async (req, res) => {
    try {
        const where = ['1=1'];
        const params = [];
        if (req.query.tenantId) { where.push('e.tenant_id = ?'); params.push(req.query.tenantId); }
        if (['health', 'security'].includes(req.query.category)) { where.push('e.category = ?'); params.push(req.query.category); }
        if (SEVERITIES.includes(req.query.severity)) { where.push('e.severity = ?'); params.push(req.query.severity); }
        if (req.query.rule) { where.push('e.rule = ?'); params.push(String(req.query.rule)); }
        if (req.query.open === '1') where.push('e.acknowledged_at IS NULL');

        const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);

        const [rows] = await query(`
            SELECT e.id, e.tenant_id, e.server_id, e.category, e.rule, e.severity, e.summary, e.details,
                   e.first_seen_at, e.last_seen_at, e.occurrences, e.emailed_at, e.acknowledged_at,
                   t.name AS tenant_name, t.slug AS tenant_slug, sv.name AS server_name,
                   TRIM(CONCAT(COALESCE(u.firstName, ''), ' ', COALESCE(u.lastName, ''))) AS acknowledged_by_name
            FROM tenant_monitor_events e
            LEFT JOIN tenants t ON t.id = e.tenant_id
            LEFT JOIN servers sv ON sv.id = e.server_id
            LEFT JOIN users u ON u.id = e.acknowledged_by
            WHERE ${where.join(' AND ')}
            ORDER BY e.last_seen_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, (page - 1) * limit]);
        const [[{ total }]] = await query(`SELECT COUNT(*) AS total FROM tenant_monitor_events e WHERE ${where.join(' AND ')}`, params);

        res.json({
            success: true,
            events: rows.map(r => ({ ...r, details: parseJson(r.details) })),
            pagination: { page, limit, total: Number(total) }
        });
    } catch (error) {
        console.error('[TenantMonitor] events failed:', error);
        res.status(500).json({ error: 'Failed to load monitor events' });
    }
});

// ── GET /metrics?range=1h|6h|24h|7d&tenantId= — dashboard time series ────
// Buckets are epoch seconds computed by the DB (UNIX_TIMESTAMP in the same
// session as the stored DATETIMEs), so no node/DB clock mixing.
const RANGES = {
    '1h': { seconds: 3600, bucket: 60 },
    '6h': { seconds: 6 * 3600, bucket: 300 },
    '24h': { seconds: 24 * 3600, bucket: 900 },
    '7d': { seconds: 7 * 86400, bucket: 3600 },
};

router.get('/metrics', async (req, res) => {
    try {
        const range = RANGES[req.query.range] ? req.query.range : '6h';
        const { seconds, bucket } = RANGES[range];
        const tenantId = req.query.tenantId ? Number(req.query.tenantId) : null;
        const tenantFilter = tenantId ? 'AND c.tenant_id = ?' : '';
        const tenantParams = tenantId ? [tenantId] : [];

        const [[{ now }]] = await query('SELECT UNIX_TIMESTAMP(NOW()) AS now');

        const [tenantSeries] = await query(`
            SELECT c.tenant_id,
                   FLOOR(UNIX_TIMESTAMP(c.checked_at) / ?) * ? AS t,
                   COUNT(*) AS checks, SUM(c.ok) AS ok_checks,
                   ROUND(AVG(CASE WHEN c.ok = 1 THEN c.latency_ms END)) AS latency_ms,
                   ROUND(AVG(c.db_latency_ms)) AS db_latency_ms,
                   ROUND(AVG(c.memory_rss_mb)) AS memory_mb,
                   MAX(c.requests_5m) AS requests_5m,
                   MAX(c.errors_5xx_5m) AS errors_5xx_5m,
                   MAX(c.errors_4xx_5m) AS errors_4xx_5m
            FROM tenant_health_checks c
            WHERE c.checked_at > NOW() - INTERVAL ? SECOND ${tenantFilter}
            GROUP BY c.tenant_id, t
            ORDER BY t
        `, [bucket, bucket, seconds, ...tenantParams]);

        const [tenantRows] = await query(`
            SELECT t.id, t.slug, t.name, COALESCE(s.health, 'unknown') AS health
            FROM tenants t LEFT JOIN tenant_monitor_state s ON s.tenant_id = t.id
            WHERE t.status IN ('trial', 'active') OR t.id IN (
                SELECT DISTINCT tenant_id FROM tenant_health_checks WHERE checked_at > NOW() - INTERVAL ? SECOND
            )
            ORDER BY t.id
        `, [seconds]);

        // Server samples are every 5 min, so never bucket finer than that.
        const serverBucket = Math.max(bucket, 300);
        const [serverSeries] = await query(`
            SELECT server_name, FLOOR(UNIX_TIMESTAMP(checked_at) / ?) * ? AS t,
                   ROUND(AVG(load1), 2) AS load1, MAX(cpu_count) AS cpu_count,
                   ROUND(AVG(mem_used_mb)) AS mem_used_mb, MAX(mem_total_mb) AS mem_total_mb,
                   ROUND(AVG(disk_used_gb)) AS disk_used_gb, MAX(disk_total_gb) AS disk_total_gb
            FROM server_metrics
            WHERE checked_at > NOW() - INTERVAL ? SECOND
            GROUP BY server_name, t
            ORDER BY t
        `, [serverBucket, serverBucket, seconds]);

        const [latestServers] = await query(`
            SELECT m.server_name, UNIX_TIMESTAMP(m.checked_at) AS t, m.load1, m.load5, m.load15, m.cpu_count,
                   m.mem_used_mb, m.mem_total_mb, m.disk_used_gb, m.disk_total_gb, m.processes
            FROM server_metrics m
            JOIN (SELECT server_name, MAX(id) AS id FROM server_metrics GROUP BY server_name) last ON last.id = m.id
            ORDER BY m.server_name
        `);

        const [eventSeries] = await query(`
            SELECT FLOOR(UNIX_TIMESTAMP(e.first_seen_at) / ?) * ? AS t, e.severity, COUNT(*) AS n
            FROM tenant_monitor_events e
            WHERE e.first_seen_at > NOW() - INTERVAL ? SECOND ${tenantId ? 'AND e.tenant_id = ?' : ''}
            GROUP BY t, e.severity
            ORDER BY t
        `, [bucket, bucket, seconds, ...tenantParams]);

        res.json({
            success: true,
            range, bucket, server_bucket: serverBucket,
            from: Number(now) - seconds, to: Number(now),
            tenants: tenantRows,
            tenant_series: tenantSeries,
            server_series: serverSeries,
            servers: latestServers.map(s => ({ ...s, processes: parseJson(s.processes) || [] })),
            event_series: eventSeries,
        });
    } catch (error) {
        console.error('[TenantMonitor] metrics failed:', error);
        res.status(500).json({ error: 'Failed to load metrics' });
    }
});

// ── POST /events/ack { ids: [] } ──────────────────────────────────────────
router.post('/events/ack', async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(Number.isInteger).slice(0, 500) : [];
    if (!ids.length) return res.status(400).json({ error: 'ids array is required' });
    try {
        const [result] = await query(
            'UPDATE tenant_monitor_events SET acknowledged_at = NOW(), acknowledged_by = ? WHERE id IN (?) AND acknowledged_at IS NULL',
            [req.user.id, ids]
        );
        res.json({ success: true, acknowledged: result.affectedRows });
    } catch (error) {
        console.error('[TenantMonitor] ack failed:', error);
        res.status(500).json({ error: 'Failed to acknowledge events' });
    }
});

module.exports = router;
