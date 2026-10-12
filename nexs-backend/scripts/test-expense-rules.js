// node scripts/test-expense-rules.js — pure-logic checks, no DB needed.
const Module = require('module');
const load = Module._load;
Module._load = function (r, ...a) { return r.endsWith('config/database') ? { pool: {} } : load.call(this, r, ...a); };
const assert = require('assert');
const { validate, addInterval } = require('../controllers/expense.controller')._test;

assert.strictEqual(addInterval('2026-01-31', 'monthly'), '2026-02-28');
assert.strictEqual(addInterval('2024-01-31', 'monthly'), '2024-02-29');
assert.strictEqual(addInterval('2026-11-30', 'quarterly'), '2027-02-28');
assert.strictEqual(addInterval('2024-02-29', 'yearly'), '2025-02-28');

const ok = { date: '2026-10-12', amount: 100 };
assert.strictEqual(validate(ok, { requireCore: true }), null);
assert.ok(validate({ ...ok, amount: -5 }, { requireCore: true }));
assert.ok(validate({ ...ok, amount: 'abc' }, { requireCore: true }));
assert.ok(validate({ ...ok, amount: 0 }, { requireCore: true }));
assert.ok(validate({ ...ok, date: '12-10-2026' }, { requireCore: true }));
assert.ok(validate({ ...ok, date: '2026-13-45' }, { requireCore: true }));
assert.ok(validate({ ...ok, tax_amount: 200 }, { requireCore: true }));
assert.ok(validate({ ...ok, type: 'refund' }, { requireCore: true }));
assert.ok(validate({ ...ok, is_recurring: true }, { requireCore: true }));
assert.ok(validate({ ...ok, receipt_url: 'javascript:alert(1)' }, { requireCore: true }));
assert.strictEqual(validate({ notes: 'x' }, { requireCore: false }), null);
console.log('expense rules OK');
