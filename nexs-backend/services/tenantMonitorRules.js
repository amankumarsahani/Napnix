/**
 * Pure rule evaluation for workers/tenantMonitorWorker.js — no DB, no network,
 * so every rule is unit-tested in scripts/test-monitor-rules.js.
 *
 * Input events come from a tenant's GET /api/internal/security-events (last 60
 * min, `age_s` computed by the tenant DB). A rule returns hits; the worker
 * persists them with a cooldown per (tenant, rule, subject), so the same burst
 * seen on several pulls stays one row and one email.
 *
 * Personal data: subjects are hashes, details carry masked emails/IPs only.
 * See nexcrm-backend/docs/PRD_tenant_monitoring.md §6.3.
 */

const crypto = require('crypto');

// Login windows are 1 h because the tenant's authRateLimit already caps one IP at
// 10 attempts per 15 min — a burst shows up as rate_limit_abuse, these catch the
// attacker who keeps coming back after each limiter window.
const THRESHOLDS = {
    bruteForceIp: { windowS: 3600, count: 20 },
    bruteForceAccount: { windowS: 3600, count: 15 },
    credentialStuffing: { windowS: 3600, distinctEmails: 10 },
    massDelete: { windowS: 3600, count: 100 },
    massExport: { windowS: 3600, count: 10 },
    rateLimitAbuse: { windowS: 900, count: 5 }, // rate_limited is throttled to 1/min/IP at the tenant
    errorSpike5xx: 50,      // per 5-min tenant counter
    scanSuspect4xx: 300,    // per 5-min tenant counter
    memoryHighMb: 700,
    slowLatencyMs: 2000,
    downAfterFailures: 3,
    crashLoopRestarts: 3,   // restarts gained between two PM2 samples (5 min apart)
    businessHours: { start: 8, end: 22 } // IST, for privilege escalation severity
};

// How long a (tenant, rule, subject) hit keeps absorbing re-detections before a new row.
const COOLDOWN_MIN = 60;

const LOGIN_FAIL_TYPES = new Set(['login_failed', 'portal_login_failed']);
const PRIVILEGED_ROLES = new Set(['admin', 'manager']);

function hash(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

function maskEmail(email) {
    if (!email || !String(email).includes('@')) return email ? '***' : null;
    const [local, domain] = String(email).split('@');
    return `${local.slice(0, 1)}***@${domain}`;
}

function maskIp(ip) {
    if (!ip) return null;
    const s = String(ip);
    if (s.includes('.')) return s.split('.').slice(0, 2).join('.') + '.x.x';
    return s.split(':').slice(0, 2).join(':') + ':x::';
}

function parseMeta(meta) {
    if (!meta) return {};
    if (typeof meta === 'object') return meta;
    try { return JSON.parse(meta); } catch { return {}; }
}

function within(events, windowS) {
    return events.filter(e => Number(e.age_s) <= windowS);
}

function groupBy(events, keyFn) {
    const groups = new Map();
    for (const e of events) {
        const key = keyFn(e);
        if (key === null || key === undefined || key === '') continue;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(e);
    }
    return groups;
}

function istHour(date) {
    return Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(date));
}

/**
 * @param {Array} events  tenant security_events rows (with age_s)
 * @param {Object} [opts] { now: Date } — injectable for tests
 * @returns {Array<{rule, severity, subject, summary, details}>}
 */
function evaluateSecurity(events, opts = {}) {
    const now = opts.now || new Date();
    const hits = [];
    const T = THRESHOLDS;

    const fails = events.filter(e => LOGIN_FAIL_TYPES.has(e.type));

    // Credential stuffing first: an IP that trips it is not also reported as plain brute force.
    const stuffingIps = new Set();
    for (const [ip, list] of groupBy(within(fails, T.credentialStuffing.windowS), e => e.ip)) {
        const emails = new Set(list.map(e => e.email).filter(Boolean));
        if (emails.size >= T.credentialStuffing.distinctEmails) {
            stuffingIps.add(ip);
            hits.push({
                rule: 'credential_stuffing', severity: 'critical', subject: hash(ip),
                summary: `${list.length} failed logins for ${emails.size} different accounts from ${maskIp(ip)} in 1 h`,
                details: { ip: maskIp(ip), attempts: list.length, distinct_accounts: emails.size, sample_accounts: [...emails].slice(0, 5).map(maskEmail) }
            });
        }
    }

    for (const [ip, list] of groupBy(within(fails, T.bruteForceIp.windowS), e => e.ip)) {
        if (stuffingIps.has(ip) || list.length < T.bruteForceIp.count) continue;
        hits.push({
            rule: 'brute_force_ip', severity: 'high', subject: hash(ip),
            summary: `${list.length} failed logins from ${maskIp(ip)} in 1 h`,
            details: { ip: maskIp(ip), attempts: list.length, paths: [...new Set(list.map(e => parseMeta(e.meta).path).filter(Boolean))] }
        });
    }

    for (const [email, list] of groupBy(within(fails, T.bruteForceAccount.windowS), e => e.email)) {
        if (list.length < T.bruteForceAccount.count) continue;
        const ips = new Set(list.map(e => e.ip).filter(Boolean));
        hits.push({
            rule: 'brute_force_account', severity: 'high', subject: hash(email),
            summary: `${list.length} failed logins for ${maskEmail(email)} in 1 h`,
            details: { account: maskEmail(email), attempts: list.length, distinct_ips: ips.size }
        });
    }

    for (const e of events) {
        const meta = parseMeta(e.meta);
        const escalated = (e.type === 'role_changed' && meta.new_role === 'admin')
            || (e.type === 'user_created' && meta.role === 'admin');
        if (!escalated) continue;
        const at = new Date(now.getTime() - Number(e.age_s) * 1000);
        const hour = istHour(at);
        const offHours = hour < T.businessHours.start || hour >= T.businessHours.end;
        hits.push({
            rule: 'privilege_escalation', severity: offHours ? 'high' : 'medium', subject: `event:${e.id}`,
            summary: e.type === 'user_created'
                ? `New admin user ${maskEmail(meta.target_email)} created by ${maskEmail(e.email)}${offHours ? ' (outside business hours)' : ''}`
                : `${maskEmail(meta.target_email)} promoted ${meta.old_role || '?'} → admin by ${maskEmail(e.email)}${offHours ? ' (outside business hours)' : ''}`,
            details: { actor: maskEmail(e.email), target: maskEmail(meta.target_email), old_role: meta.old_role || null, ist_hour: hour }
        });
    }

    for (const [userId, list] of groupBy(within(events.filter(e => e.type === 'delete'), T.massDelete.windowS), e => e.user_id)) {
        if (list.length < T.massDelete.count) continue;
        hits.push({
            rule: 'mass_delete', severity: 'high', subject: `user:${userId}`,
            summary: `${maskEmail(list[0].email)} deleted ${list.length} records in 1 h`,
            details: { actor: maskEmail(list[0].email), deletes: list.length, top_paths: topPaths(list) }
        });
    }

    for (const [userId, list] of groupBy(within(events.filter(e => e.type === 'export'), T.massExport.windowS), e => e.user_id)) {
        if (list.length < T.massExport.count) continue;
        hits.push({
            rule: 'mass_export', severity: 'medium', subject: `user:${userId}`,
            summary: `${maskEmail(list[0].email)} ran ${list.length} exports in 1 h`,
            details: { actor: maskEmail(list[0].email), exports: list.length, top_paths: topPaths(list) }
        });
    }

    for (const [ip, list] of groupBy(within(events.filter(e => e.type === 'rate_limited'), T.rateLimitAbuse.windowS), e => e.ip)) {
        if (list.length < T.rateLimitAbuse.count) continue;
        hits.push({
            rule: 'rate_limit_abuse', severity: 'low', subject: hash(ip),
            summary: `${maskIp(ip)} kept hitting rate limits for ${list.length}+ minutes`,
            details: { ip: maskIp(ip), minutes_limited: list.length, top_paths: topPaths(list) }
        });
    }

    return hits;
}

function topPaths(list) {
    const counts = {};
    for (const e of list) {
        // Collapse ids so /api/leads/12 and /api/leads/13 count together.
        const p = String(parseMeta(e.meta).path || '?').replace(/\/\d+(?=\/|$)/g, '/:id');
        counts[p] = (counts[p] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, count]) => ({ path, count }));
}

/** Admin/manager logins with a usable IP, for the admin_new_country check (needs geo + DB, done in the worker). */
function privilegedLogins(events) {
    return events.filter(e => e.type === 'login_success' && e.user_id && e.ip && PRIVILEGED_ROLES.has(parseMeta(e.meta).role));
}

/**
 * Metric rules from one deep-health sample.
 * @param {Object} sample { counters, memory_rss_mb, latencies: number[] (most recent last) }
 */
function evaluateHealthMetrics(sample) {
    const T = THRESHOLDS;
    const hits = [];
    const c = sample.counters || {};
    if (c.errors_5xx >= T.errorSpike5xx) {
        hits.push({ rule: 'error_spike', severity: 'medium', subject: '', summary: `${c.errors_5xx} server errors (5xx) in 5 min`, details: { errors_5xx: c.errors_5xx, requests: c.requests } });
    }
    if (c.errors_4xx >= T.scanSuspect4xx) {
        hits.push({ rule: 'scan_suspect', severity: 'low', subject: '', summary: `${c.errors_4xx} client errors (4xx) in 5 min — possible scanning`, details: { errors_4xx: c.errors_4xx, requests: c.requests } });
    }
    if (sample.memory_rss_mb >= T.memoryHighMb) {
        hits.push({ rule: 'memory_high', severity: 'medium', subject: '', summary: `Process memory ${sample.memory_rss_mb} MB`, details: { memory_rss_mb: sample.memory_rss_mb } });
    }
    const lat = (sample.latencies || []).slice(-10);
    if (lat.length >= 5) {
        const sorted = [...lat].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        if (median > T.slowLatencyMs) {
            hits.push({ rule: 'slow', severity: 'medium', subject: '', summary: `Median health latency ${median} ms over last ${lat.length} checks`, details: { median_ms: median } });
        }
    }
    return hits;
}

/**
 * Next health state after one check.
 * @returns {{ health, consecutive_failures, transition: 'down'|'recovered'|null }}
 */
function nextHealthState(prev, ok) {
    const failures = ok ? 0 : (prev.consecutive_failures || 0) + 1;
    if (ok) {
        return { health: 'up', consecutive_failures: 0, transition: prev.health === 'down' ? 'recovered' : null };
    }
    if (failures >= THRESHOLDS.downAfterFailures) {
        return { health: 'down', consecutive_failures: failures, transition: prev.health === 'down' ? null : 'down' };
    }
    return { health: 'degraded', consecutive_failures: failures, transition: null };
}

/**
 * PM2 rules for one tenant.
 * @param {Object} tenant   { process_status }
 * @param {Object|null} proc  parsed pm2 jlist entry or null when missing
 * @param {number|null} prevRestarts  restart count from the previous sample
 */
function evaluatePm2(tenant, proc, prevRestarts) {
    const hits = [];
    const status = proc ? proc.pm2_env?.status : 'missing';
    if (tenant.process_status === 'running' && status !== 'online') {
        hits.push({ rule: 'pm2_mismatch', severity: 'high', subject: '', summary: `Marked running but PM2 status is ${status}`, details: { pm2_status: status } });
    }
    const restarts = proc ? Number(proc.pm2_env?.restart_time || 0) : null;
    if (restarts !== null && prevRestarts !== null && prevRestarts !== undefined
        && restarts - prevRestarts >= THRESHOLDS.crashLoopRestarts) {
        hits.push({ rule: 'crash_loop', severity: 'high', subject: '', summary: `PM2 restarted ${restarts - prevRestarts} times in ~5 min`, details: { restarts_total: restarts, gained: restarts - prevRestarts } });
    }
    return hits;
}

/**
 * Parse the worker's HOST_SAMPLE_COMMAND output: loadavg, nproc, `free -m` Mem
 * (total used), `df -BG` (size used), then `__PM2__` and `pm2 jlist`.
 * Host fields are null when a line is missing; PM2 must parse or this throws.
 */
function parseHostSample(stdout) {
    const marker = stdout.indexOf('__PM2__');
    const head = (marker >= 0 ? stdout.slice(0, marker) : '').split('\n').map(l => l.trim()).filter(Boolean);
    const pm2Out = marker >= 0 ? stdout.slice(marker + '__PM2__'.length) : stdout;
    // pm2 can print warning lines (e.g. "[PM2] ...") before the JSON array.
    const start = pm2Out.search(/^\[(\{|\])/m);
    const procs = JSON.parse(start >= 0 ? pm2Out.slice(start) : pm2Out);

    const num = v => (v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
    const load = (head[0] || '').split(/\s+/).slice(0, 3).map(num);
    const [memTotal, memUsed] = (head[2] || '').split(/\s+/).map(num);
    const [diskSize, diskUsed] = (head[3] || '').replace(/G/g, '').split(/\s+/).map(num);
    return {
        host: {
            load: [load[0] ?? null, load[1] ?? null, load[2] ?? null],
            cpu_count: num(head[1]),
            mem_total_mb: memTotal ?? null, mem_used_mb: memUsed ?? null,
            disk_total_gb: diskSize ?? null, disk_used_gb: diskUsed ?? null
        },
        procs
    };
}

/** Keep only what the dashboard shows — never the process env (it holds secrets). */
function summarizeProcesses(procs) {
    return (procs || []).map(p => ({
        name: p.name,
        status: p.pm2_env?.status || 'unknown',
        cpu: p.monit?.cpu ?? null,
        mem_mb: p.monit?.memory != null ? Math.round(p.monit.memory / 1048576) : null,
        restarts: Number(p.pm2_env?.restart_time || 0),
        uptime_s: p.pm2_env?.status === 'online' && p.pm2_env?.pm_uptime ? Math.round((Date.now() - p.pm2_env.pm_uptime) / 1000) : null
    }));
}

module.exports = {
    parseHostSample, summarizeProcesses,
    THRESHOLDS, COOLDOWN_MIN,
    evaluateSecurity, evaluateHealthMetrics, nextHealthState, evaluatePm2, privilegedLogins,
    maskEmail, maskIp, hash, parseMeta
};
