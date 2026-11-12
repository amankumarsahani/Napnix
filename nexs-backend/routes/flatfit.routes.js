// FlatFit admin (flatmate app run by Napnix). Mounted under the admin router (auth + isAdmin).
// Reads and writes FlatFit's own database (`flatfit`), not nexspire_solutions:
// FLATFIT_DB_URL=mysql://flatfit:<password>@127.0.0.1:3306/flatfit
const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

let pool = null;
const db = () => {
    if (!process.env.FLATFIT_DB_URL) return null;
    pool = pool || mysql.createPool({ uri: process.env.FLATFIT_DB_URL, connectionLimit: 4, waitForConnections: true });
    return pool;
};
router.use((req, res, next) => (db() ? next() : res.status(503).json({ error: 'FlatFit database is not configured (FLATFIT_DB_URL)' })));

const fail = (res, what) => (error) => {
    console.error(`[FlatFit admin] ${what} failed:`, error.message);
    res.status(500).json({ error: `Failed to ${what}` });
};
const cityOf = (area) => (area.startsWith('Greater Noida') ? 'Greater Noida West' : area.startsWith('Noida') ? 'Noida' : 'Gurgaon');
const list = (v) => { try { return JSON.parse(v || '[]'); } catch { return []; } };

// ── GET /overview ─────────────────────────────────────────────────────────
router.get('/overview', (req, res) => {
    const q = (sql) => db().query(sql).then(([rows]) => rows);
    Promise.all([
        q(`SELECT status, COUNT(*) n FROM users GROUP BY status`),
        q(`SELECT COUNT(*) n FROM users WHERE status = 'active' AND created_at > NOW() - INTERVAL 7 DAY`),
        q(`SELECT p.role, p.areas FROM profiles p JOIN users u ON u.id = p.user_id WHERE u.status = 'active' AND u.consent_at IS NOT NULL`),
        q(`SELECT COUNT(*) n FROM verifications WHERE kind = 'aadhaar_qr'`),
        q(`SELECT COUNT(*) n, SUM(share_a AND share_b) shared FROM matches`),
        q(`SELECT COUNT(*) n FROM messages`),
        q(`SELECT COUNT(*) n FROM reports WHERE status = 'open'`),
        q(`SELECT COUNT(*) n, SUM(created_at > NOW() - INTERVAL 7 DAY) week FROM waitlist`),
    ]).then(([status, week, profiles, verified, matches, messages, reports, waitlist]) => {
        const byStatus = Object.fromEntries(status.map(r => [r.status, Number(r.n)]));
        const cities = {}, roles = {};
        for (const p of profiles) {
            roles[p.role] = (roles[p.role] || 0) + 1;
            for (const c of new Set(list(p.areas).map(cityOf))) cities[c] = (cities[c] || 0) + 1;
        }
        res.json({
            users: { active: byStatus.active || 0, banned: byStatus.banned || 0, deleted: byStatus.deleted || 0, new_7d: Number(week[0].n) },
            profiles: profiles.length, roles, cities,
            verified: Number(verified[0].n),
            matches: Number(matches[0].n), numbers_shared: Number(matches[0].shared || 0),
            messages: Number(messages[0].n),
            open_reports: Number(reports[0].n),
            waitlist: { total: Number(waitlist[0].n), new_7d: Number(waitlist[0].week || 0) },
        });
    }).catch(fail(res, 'load FlatFit overview'));
});

// ── GET /reports?status=open|actioned|dismissed ─────────────────────────────
const REPORT_STATUS = ['open', 'actioned', 'dismissed'];
router.get('/reports', (req, res) => {
    const status = REPORT_STATUS.includes(req.query.status) ? req.query.status : 'open';
    db().query(`
        SELECT r.id, r.reason, r.details, r.status, r.created_at, r.match_id,
               r.reporter, ra.name AS reporter_name, COALESCE(ra.email, ra.phone) AS reporter_login,
               r.reported, rd.name AS reported_name, COALESCE(rd.email, rd.phone) AS reported_login, rd.status AS reported_status,
               (SELECT COUNT(*) FROM reports x WHERE x.reported = r.reported) AS reports_against
        FROM reports r
        JOIN users ra ON ra.id = r.reporter
        JOIN users rd ON rd.id = r.reported
        WHERE r.status = ?
        ORDER BY r.created_at ${status === 'open' ? 'ASC' : 'DESC'}
        LIMIT 200`, [status])
        .then(([rows]) => res.json({ reports: rows }))
        .catch(fail(res, 'load reports'));
});

// ── POST /reports/:id { action: 'ban' | 'dismiss' } ─────────────────────────
// ban: the reported person is banned at once (the app logs them out on their next request) and every
// open report against them is closed as actioned. dismiss: only this report is closed.
router.post('/reports/:id', async (req, res) => {
    const { action } = req.body || {};
    if (!['ban', 'dismiss'].includes(action)) return res.status(400).json({ error: 'action must be ban or dismiss' });
    try {
        const [[report]] = await db().query('SELECT id, reported FROM reports WHERE id = ?', [req.params.id]);
        if (!report) return res.status(404).json({ error: 'Report not found' });
        if (action === 'dismiss') {
            await db().query(`UPDATE reports SET status = 'dismissed' WHERE id = ?`, [report.id]);
        } else {
            await db().query(`UPDATE users SET status = 'banned' WHERE id = ? AND status <> 'deleted'`, [report.reported]);
            await db().query(`UPDATE reports SET status = 'actioned' WHERE reported = ? AND status = 'open'`, [report.reported]);
        }
        console.log(`[FlatFit admin] report ${report.id} ${action} by admin ${req.user?.id}`);
        res.json({ success: true });
    } catch (error) { fail(res, 'update report')(error); }
});

// ── GET /users?q=&status=&page= ─────────────────────────────────────────────
router.get('/users', (req, res) => {
    const limit = 50;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const where = [];
    const args = [];
    if (['active', 'banned', 'deleted'].includes(req.query.status)) { where.push('u.status = ?'); args.push(req.query.status); }
    if (req.query.q) {
        const like = `%${String(req.query.q).trim()}%`;
        where.push('(u.email LIKE ? OR u.phone LIKE ? OR u.name LIKE ?)');
        args.push(like, like, like);
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    Promise.all([
        db().query(`
            SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, u.consent_at IS NOT NULL AS visible,
                   p.role, p.areas, v.user_id IS NOT NULL AS verified,
                   (SELECT COUNT(*) FROM reports r WHERE r.reported = u.id) AS reports_against
            FROM users u
            LEFT JOIN profiles p ON p.user_id = u.id
            LEFT JOIN verifications v ON v.user_id = u.id AND v.kind = 'aadhaar_qr'
            ${w} ORDER BY u.id DESC LIMIT ? OFFSET ?`, [...args, limit, (page - 1) * limit]),
        db().query(`SELECT COUNT(*) n FROM users u ${w}`, args),
    ]).then(([[rows], [[count]]]) => res.json({
        users: rows.map(r => ({ ...r, areas: list(r.areas), visible: !!r.visible, verified: !!r.verified })),
        pagination: { page, limit, total: Number(count.n) },
    })).catch(fail(res, 'load users'));
});

// ── POST /users/:id/status { status: 'active' | 'banned' } ─────────────────
router.post('/users/:id/status', (req, res) => {
    const { status } = req.body || {};
    if (!['active', 'banned'].includes(status)) return res.status(400).json({ error: 'status must be active or banned' });
    // a deleted account stays deleted: it is only kept for the legal retention period
    db().query(`UPDATE users SET status = ? WHERE id = ? AND status <> 'deleted'`, [status, req.params.id])
        .then(([r]) => {
            if (!r.affectedRows) return res.status(404).json({ error: 'User not found or deleted' });
            console.log(`[FlatFit admin] user ${req.params.id} -> ${status} by admin ${req.user?.id}`);
            res.json({ success: true });
        })
        .catch(fail(res, 'update user'));
});

// ── GET /waitlist ───────────────────────────────────────────────────────────
const MOVE_IN = ['This month', 'Next month', 'In 2 months', 'Flexible'];
router.get('/waitlist', (req, res) => {
    db().query(`SELECT id, contact, station, moving, role, created_at, updated_at FROM waitlist ORDER BY created_at DESC LIMIT 2000`)
        .then(([rows]) => res.json({ waitlist: rows.map(r => ({ ...r, moving: MOVE_IN[r.moving] || '' })) }))
        .catch(fail(res, 'load early-access sign-ups'));
});

module.exports = router;
