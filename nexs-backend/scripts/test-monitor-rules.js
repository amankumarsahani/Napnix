// node scripts/test-monitor-rules.js — pure-logic checks for tenant monitoring, no DB needed.
const assert = require('assert');
const R = require('../services/tenantMonitorRules');

const ev = (type, o = {}) => ({ id: o.id || Math.floor(Math.random() * 1e9), type, age_s: 60, ip: '1.2.3.4', email: 'a@x.com', user_id: 7, meta: null, ...o });
const rules = (hits) => hits.map(h => h.rule).sort();
const times = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

// Brute force by IP: 20 fails in 1 h trip it, 19 do not, older fails don't count.
assert.deepStrictEqual(rules(R.evaluateSecurity(times(19, i => ev('login_failed', { email: `v${i % 3}@x.com` })))), []);
assert.deepStrictEqual(rules(R.evaluateSecurity(times(20, () => ev('login_failed', { email: 'v@x.com', ip: '9.9.9.9' })))), ['brute_force_account', 'brute_force_ip']);
assert.deepStrictEqual(rules(R.evaluateSecurity(times(20, () => ev('login_failed', { age_s: 4000, email: null })))), []);
// Portal (storefront customer) failures count too.
assert.deepStrictEqual(rules(R.evaluateSecurity(times(20, () => ev('portal_login_failed', { email: null })))), ['brute_force_ip']);

// Brute force on one account from many IPs.
assert.deepStrictEqual(rules(R.evaluateSecurity(times(14, i => ev('login_failed', { ip: `5.5.5.${i}` })))), []);
assert.deepStrictEqual(rules(R.evaluateSecurity(times(15, i => ev('login_failed', { ip: `5.5.5.${i}` })))), ['brute_force_account']);

// Credential stuffing: many accounts from one IP replaces brute_force_ip for that IP.
assert.deepStrictEqual(rules(R.evaluateSecurity(times(9, i => ev('login_failed', { email: `u${i}@x.com` })))), []);
const stuffing = R.evaluateSecurity(times(20, i => ev('login_failed', { email: `u${i % 10}@x.com` })));
assert.deepStrictEqual(rules(stuffing), ['credential_stuffing']);
assert.strictEqual(stuffing[0].severity, 'critical');
// No raw PII in the hit.
const blob = JSON.stringify(stuffing);
assert.ok(!blob.includes('1.2.3.4') && !blob.includes('u1@x.com'), 'hit leaks raw ip/email');
assert.strictEqual(stuffing[0].details.ip, '1.2.x.x');

// Privilege escalation: promotion to admin only; severity by IST hour.
const noon = new Date('2026-10-28T06:30:00Z');   // 12:00 IST
const night = new Date('2026-10-28T20:30:00Z');  // 02:00 IST
const promo = ev('role_changed', { age_s: 0, meta: JSON.stringify({ new_role: 'admin', old_role: 'user', target_email: 't@x.com' }) });
assert.strictEqual(R.evaluateSecurity([promo], { now: noon })[0].severity, 'medium');
assert.strictEqual(R.evaluateSecurity([promo], { now: night })[0].severity, 'high');
assert.deepStrictEqual(rules(R.evaluateSecurity([ev('role_changed', { meta: { new_role: 'manager' } })])), []);
assert.deepStrictEqual(rules(R.evaluateSecurity([ev('user_created', { meta: { role: 'admin' } })], { now: noon })), ['privilege_escalation']);

// Mass delete / export are per user, inside 1 h.
assert.deepStrictEqual(rules(R.evaluateSecurity(times(100, () => ev('delete', { meta: { path: '/api/leads/5' } })))), ['mass_delete']);
assert.deepStrictEqual(rules(R.evaluateSecurity(times(99, () => ev('delete')))), []);
assert.deepStrictEqual(rules(R.evaluateSecurity(times(100, i => ev('delete', { user_id: i })))), []);
const md = R.evaluateSecurity(times(100, i => ev('delete', { meta: { path: `/api/leads/${i}` } })));
assert.deepStrictEqual(md[0].details.top_paths, [{ path: '/api/leads/:id', count: 100 }]);
assert.deepStrictEqual(rules(R.evaluateSecurity(times(10, () => ev('export')))), ['mass_export']);
assert.deepStrictEqual(rules(R.evaluateSecurity(times(5, () => ev('rate_limited')))), ['rate_limit_abuse']);

// Privileged logins for the country check.
assert.strictEqual(R.privilegedLogins([
    ev('login_success', { meta: '{"role":"admin"}' }),
    ev('login_success', { meta: '{"role":"user"}' }),
    ev('login_success', { meta: '{"role":"manager"}', ip: null })
]).length, 1);

// Health state machine: degraded, degraded, down (once), stays down, recovers.
let s = { health: 'up', consecutive_failures: 0 };
s = R.nextHealthState(s, false); assert.deepStrictEqual([s.health, s.transition], ['degraded', null]);
s = R.nextHealthState(s, false); assert.deepStrictEqual([s.health, s.transition], ['degraded', null]);
s = R.nextHealthState(s, false); assert.deepStrictEqual([s.health, s.transition], ['down', 'down']);
s = R.nextHealthState(s, false); assert.deepStrictEqual([s.health, s.transition], ['down', null]);
s = R.nextHealthState(s, true); assert.deepStrictEqual([s.health, s.transition], ['up', 'recovered']);
assert.strictEqual(R.nextHealthState({ health: 'degraded', consecutive_failures: 2 }, true).transition, null);

// Metric rules.
assert.deepStrictEqual(rules(R.evaluateHealthMetrics({ counters: { errors_5xx: 50, errors_4xx: 300 }, memory_rss_mb: 700, latencies: [3000, 3000, 3000, 3000, 3000] })),
    ['error_spike', 'memory_high', 'scan_suspect', 'slow']);
assert.deepStrictEqual(rules(R.evaluateHealthMetrics({ counters: { errors_5xx: 1 }, memory_rss_mb: 200, latencies: [3000, 3000, 3000, 3000] })), []);
assert.deepStrictEqual(rules(R.evaluateHealthMetrics({})), []);

// PM2 rules.
const online = (restarts) => ({ pm2_env: { status: 'online', restart_time: restarts } });
assert.deepStrictEqual(rules(R.evaluatePm2({ process_status: 'running' }, online(5), 5)), []);
assert.deepStrictEqual(rules(R.evaluatePm2({ process_status: 'running' }, online(8), 5)), ['crash_loop']);
assert.deepStrictEqual(rules(R.evaluatePm2({ process_status: 'running' }, online(8), null)), []);
assert.deepStrictEqual(rules(R.evaluatePm2({ process_status: 'running' }, null, 5)), ['pm2_mismatch']);
assert.deepStrictEqual(rules(R.evaluatePm2({ process_status: 'running' }, { pm2_env: { status: 'errored', restart_time: 1 } }, 1)), ['pm2_mismatch']);

// Masking.
assert.strictEqual(R.maskEmail('anu@napnix.in'), 'a***@napnix.in');
assert.strictEqual(R.maskIp('103.21.5.6'), '103.21.x.x');
assert.strictEqual(R.maskIp('2405:201:abcd::1'), '2405:201:x::');

// Host sample parsing (HOST_SAMPLE_COMMAND output).
const hostOut = [
    '0.52 0.61 0.70 2/345 12345', '4', '7942 5120', ' 79G 41G', '__PM2__',
    '[PM2] Spawning PM2 daemon',
    JSON.stringify([{ name: 'tenant-a', pm2_env: { status: 'online', restart_time: 3, pm_uptime: Date.now() - 60000, env: { DB_PASSWORD: 'secret' } }, monit: { cpu: 1.5, memory: 157286400 } }])
].join('\n');
const sample = R.parseHostSample(hostOut);
assert.deepStrictEqual(sample.host, { load: [0.52, 0.61, 0.7], cpu_count: 4, mem_total_mb: 7942, mem_used_mb: 5120, disk_total_gb: 79, disk_used_gb: 41 });
const procs = R.summarizeProcesses(sample.procs);
assert.deepStrictEqual({ ...procs[0], uptime_s: procs[0].uptime_s >= 59 }, { name: 'tenant-a', status: 'online', cpu: 1.5, mem_mb: 150, restarts: 3, uptime_s: true });
assert.ok(!JSON.stringify(procs).includes('secret'), 'process env leaked');
// Missing host lines degrade to nulls; plain `pm2 jlist` output still parses.
assert.strictEqual(R.parseHostSample('[]').host.cpu_count, null);
assert.throws(() => R.parseHostSample('__PM2__\nnot json'));

console.log('monitor rules OK');
