const { pool } = require('../config/database');
const { today } = require('../utils/businessClock');

const TYPES = ['expense', 'deposit'];
const METHODS = ['cash', 'card', 'bank_transfer', 'upi', 'other'];
const ACCOUNTS = ['bank', 'cash', 'upi', 'card', 'wallet', 'other'];
const INTERVALS = ['monthly', 'quarterly', 'yearly'];
const STATUSES = ['pending', 'approved', 'rejected'];
const MAX_BULK = 100;
const LIVE = 'deleted_at IS NULL';
// Only approved, non-deleted rows count towards totals.
const COUNTED = `${LIVE} AND status = 'approved'`;

const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v + 'T00:00:00Z'));
const isMoney = (v) => Number.isFinite(v) && v >= 0 && v < 1e10;

// Returns an error string or null. Only keys present in `b` are checked, so it serves create and patch.
function validate(b, { requireCore }) {
    if (requireCore && (!b.date || b.amount === undefined || b.amount === '')) return 'date and amount are required';
    if (b.date !== undefined && !isDate(String(b.date))) return 'date must be YYYY-MM-DD';
    if (b.amount !== undefined) {
        const a = parseFloat(b.amount);
        if (!isMoney(a) || a === 0) return 'amount must be a positive number';
    }
    if (b.tax_amount != null && b.tax_amount !== '') {
        const t = parseFloat(b.tax_amount);
        if (!isMoney(t)) return 'tax_amount must be a non-negative number';
        if (b.amount !== undefined && t > parseFloat(b.amount)) return 'tax_amount cannot exceed amount';
    }
    const enums = [['type', TYPES], ['payment_method', METHODS], ['account', ACCOUNTS],
        ['recurring_interval', INTERVALS], ['status', STATUSES]];
    for (const [k, list] of enums) {
        if (b[k] !== undefined && b[k] !== null && b[k] !== '' && !list.includes(b[k])) {
            return `${k} must be one of: ${list.join(', ')}`;
        }
    }
    if (b.currency != null && !/^[A-Z]{3}$/.test(b.currency)) return 'currency must be a 3-letter code';
    if (b.is_recurring && !INTERVALS.includes(b.recurring_interval)) return 'recurring_interval is required when is_recurring is set';
    if (b.category !== undefined && (!String(b.category).trim() || String(b.category).length > 100)) return 'category must be 1-100 chars';
    if (b.receipt_url && !/^https?:\/\//i.test(b.receipt_url)) return 'receipt_url must be an http(s) URL';
    return null;
}

function addInterval(dateStr, interval) {
    const d = new Date(dateStr + 'T00:00:00Z');
    const day = d.getUTCDate();
    d.setUTCMonth(d.getUTCMonth() + (interval === 'yearly' ? 12 : interval === 'quarterly' ? 3 : 1));
    if (d.getUTCDate() !== day) d.setUTCDate(0); // Jan 31 + 1 month -> Feb 28/29, not Mar 3
    return d.toISOString().slice(0, 10);
}

// Money records need a trail: who did what, and what the row looked like.
async function audit(db, expenseId, action, userId, snapshot) {
    await db.query(
        'INSERT INTO expense_audit_log (expense_id, action, user_id, snapshot) VALUES (?, ?, ?, ?)',
        [expenseId, action, userId || null, snapshot ? JSON.stringify(snapshot) : null]
    );
}

// Keep spent_by (display name) and spent_by_id (FK) in step. Returns null for an unknown id.
async function resolvePerson(db, body) {
    // A name wins over an id: the edit form resends the old id when only the name was changed.
    if (body.spent_by) {
        const [[p]] = await db.query('SELECT id, name FROM expense_people WHERE name = ?', [body.spent_by]);
        return { id: p ? p.id : null, name: p ? p.name : body.spent_by };
    }
    if (body.spent_by_id) {
        const [[p]] = await db.query('SELECT id, name FROM expense_people WHERE id = ?', [body.spent_by_id]);
        return p ? { id: p.id, name: p.name } : null;
    }
    return { id: null, name: null };
}

class ExpenseController {
    async getAll(req, res) {
        try {
            const {
                page = 1, limit: rawLimit = 50,
                type, date_from, date_to,
                category, payment_method, account, status,
                search, is_recurring, spent_by, deleted
            } = req.query;

            const limit = Math.min(Math.max(parseInt(rawLimit) || 50, 1), 100000);
            const pageNo = Math.max(parseInt(page) || 1, 1);
            const offset = (pageNo - 1) * limit;
            const conditions = [deleted === 'true' ? 'deleted_at IS NOT NULL' : LIVE]; // ?deleted=true = recycle bin
            const params = [];

            if (type)          { conditions.push('type = ?');            params.push(type); }
            if (status)        { conditions.push('status = ?');          params.push(status); }
            if (account)       { conditions.push('account = ?');         params.push(account); }
            if (date_from)     { conditions.push('date >= ?');           params.push(date_from); }
            if (date_to)       { conditions.push('date <= ?');           params.push(date_to); }
            if (category)      { conditions.push('category = ?');        params.push(category); }
            if (payment_method){ conditions.push('payment_method = ?');  params.push(payment_method); }
            if (spent_by)      { conditions.push('spent_by = ?');        params.push(spent_by); }
            if (is_recurring !== undefined && is_recurring !== '') {
                conditions.push('is_recurring = ?');
                params.push(is_recurring === 'true' || is_recurring === '1' ? 1 : 0);
            }
            if (search) {
                conditions.push('(vendor LIKE ? OR description LIKE ? OR notes LIKE ? OR reference LIKE ? OR spent_by LIKE ?)');
                const like = `%${search}%`;
                params.push(like, like, like, like, like);
            }

            const where = 'WHERE ' + conditions.join(' AND ');

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) as total FROM expenses ${where}`, params
            );
            const [rows] = await pool.query(
                `SELECT * FROM expenses ${where} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            );

            res.json({
                success: true,
                data: rows,
                pagination: { page: pageNo, limit, total, pages: Math.ceil(total / limit) }
            });
        } catch (err) {
            console.error('Expenses getAll error:', err);
            res.status(500).json({ error: 'Failed to fetch records' });
        }
    }

    async getStats(req, res) {
        try {
            // IST, not server time: the box runs America/New_York.
            const t = today();
            const monthStart = t.slice(0, 8) + '01';
            const yearStart  = t.slice(0, 4) + '-01-01';

            const byType = async (from) => {
                const [rows] = await pool.query(
                    `SELECT type, COALESCE(SUM(amount),0) as total FROM expenses
                     WHERE ${COUNTED} AND date >= ? AND date <= ? GROUP BY type`, [from, t]
                );
                return Object.fromEntries(rows.map(r => [r.type, parseFloat(r.total)]));
            };
            const monthByType = await byType(monthStart);
            const ytdByType = await byType(yearStart);

            const byCategory = async (type) => {
                const [rows] = await pool.query(
                    `SELECT category, COALESCE(SUM(amount),0) as total, COUNT(*) as count
                     FROM expenses WHERE ${COUNTED} AND type = ? GROUP BY category ORDER BY total DESC`, [type]
                );
                return rows.map(r => ({ ...r, total: parseFloat(r.total) }));
            };
            const expByCategory = await byCategory('expense');
            const depByCategory = await byCategory('deposit');

            // Monthly trend (last 12 months, both types) merged into { month, expense, deposit }
            const [monthlyTrend] = await pool.query(
                `SELECT DATE_FORMAT(date,'%Y-%m') as month, type, COALESCE(SUM(amount),0) as total
                 FROM expenses
                 WHERE ${COUNTED} AND date >= DATE_SUB(?, INTERVAL 12 MONTH) AND date <= ?
                 GROUP BY month, type ORDER BY month ASC`, [t, t]
            );
            const trendMap = {};
            for (const r of monthlyTrend) {
                if (!trendMap[r.month]) trendMap[r.month] = { month: r.month, expense: 0, deposit: 0 };
                trendMap[r.month][r.type] = parseFloat(r.total);
            }
            const trend = Object.values(trendMap).sort((a, b) => a.month.localeCompare(b.month));

            // Recurring templates only (generated copies have is_recurring = 0)
            const [[recurringRow]] = await pool.query(
                `SELECT COALESCE(SUM(
                    CASE recurring_interval
                        WHEN 'monthly'   THEN amount
                        WHEN 'quarterly' THEN amount / 3
                        WHEN 'yearly'    THEN amount / 12
                        ELSE amount
                    END
                 ),0) as monthly_total
                 FROM expenses WHERE ${COUNTED} AND is_recurring = 1 AND type = 'expense'`
            );

            const [bySpender] = await pool.query(
                `SELECT spent_by, COALESCE(SUM(amount),0) as total, COUNT(*) as count
                 FROM expenses
                 WHERE ${COUNTED} AND type = 'expense' AND spent_by IS NOT NULL AND spent_by <> ''
                   AND date >= ? AND date <= ?
                 GROUP BY spent_by ORDER BY total DESC`, [yearStart, t]
            );

            // Balance per account across all time (deposits in, expenses out).
            const [balances] = await pool.query(
                `SELECT account,
                        COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE -amount END),0) AS balance
                 FROM expenses WHERE ${COUNTED} GROUP BY account ORDER BY account`
            );

            const [[{ pending }]] = await pool.query(
                `SELECT COUNT(*) AS pending FROM expenses WHERE ${LIVE} AND status = 'pending'`
            );

            const [allCategories] = await pool.query(
                `SELECT DISTINCT category, type FROM expenses WHERE ${LIVE} ORDER BY type, category`
            );

            const expYtd = ytdByType['expense'] || 0;
            const depYtd = ytdByType['deposit'] || 0;

            res.json({
                success: true,
                data: {
                    expense: {
                        thisMonth: monthByType['expense'] || 0,
                        ytd: expYtd,
                        topCategory: expByCategory[0]?.category || null,
                        recurringPerMonth: parseFloat(recurringRow.monthly_total),
                        byCategory: expByCategory,
                    },
                    deposit: {
                        thisMonth: monthByType['deposit'] || 0,
                        ytd: depYtd,
                        topCategory: depByCategory[0]?.category || null,
                        byCategory: depByCategory,
                    },
                    net: {
                        thisMonth: (monthByType['deposit'] || 0) - (monthByType['expense'] || 0),
                        ytd: depYtd - expYtd,
                    },
                    monthlyTrend: trend,
                    bySpender: bySpender.map(r => ({ ...r, total: parseFloat(r.total) })),
                    accountBalances: balances.map(r => ({ account: r.account, balance: parseFloat(r.balance) })),
                    pendingApprovals: pending,
                    allExpenseCategories: allCategories.filter(r => r.type === 'expense').map(r => r.category),
                    allDepositCategories: allCategories.filter(r => r.type === 'deposit').map(r => r.category),
                }
            });
        } catch (err) {
            console.error('Expenses getStats error:', err);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }

    // ─── People (who spent the money) ───────────────────────────────────────
    // expenses.spent_by_id links here; spent_by keeps the name as saved, so removing a
    // person never rewrites history — it only drops them from the dropdown.

    async listPeople(req, res) {
        try {
            const [rows] = await pool.query(
                'SELECT id, name, is_active FROM expense_people WHERE is_active = 1 ORDER BY name ASC'
            );
            // Legacy names typed before this table existed still show up.
            const [used] = await pool.query(
                `SELECT DISTINCT spent_by FROM expenses WHERE ${LIVE} AND spent_by IS NOT NULL AND spent_by <> ""`
            );
            const known = new Set(rows.map(r => r.name));
            const orphans = used
                .map(r => r.spent_by)
                .filter(n => !known.has(n))
                .map(n => ({ id: null, name: n, is_active: 1 }));

            res.json({ success: true, data: [...rows, ...orphans].sort((a, b) => a.name.localeCompare(b.name)) });
        } catch (err) {
            console.error('Expense people list error:', err);
            res.status(500).json({ error: 'Failed to fetch people' });
        }
    }

    async createPerson(req, res) {
        try {
            const name = (req.body.name || '').trim();
            if (!name) return res.status(400).json({ error: 'name is required' });
            if (name.length > 150) return res.status(400).json({ error: 'name is too long' });

            const [[existing]] = await pool.query('SELECT * FROM expense_people WHERE name = ?', [name]);
            if (existing) {
                if (!existing.is_active) {
                    await pool.query('UPDATE expense_people SET is_active = 1 WHERE id = ?', [existing.id]);
                    return res.status(200).json({ success: true, data: { ...existing, is_active: 1 } });
                }
                return res.status(409).json({ error: 'Person already exists' });
            }

            const [result] = await pool.query(
                'INSERT INTO expense_people (name, created_by) VALUES (?, ?)',
                [name, req.user?.id || null]
            );
            // Link any legacy rows that were saved with this name before the person existed.
            await pool.query('UPDATE expenses SET spent_by_id = ? WHERE spent_by = ? AND spent_by_id IS NULL', [result.insertId, name]);
            const [[created]] = await pool.query('SELECT * FROM expense_people WHERE id = ?', [result.insertId]);
            res.status(201).json({ success: true, data: created });
        } catch (err) {
            console.error('Expense person create error:', err);
            res.status(500).json({ error: 'Failed to add person' });
        }
    }

    async deletePerson(req, res) {
        try {
            const [result] = await pool.query(
                'UPDATE expense_people SET is_active = 0 WHERE id = ?', [req.params.id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Person not found' });
            res.json({ success: true });
        } catch (err) {
            console.error('Expense person delete error:', err);
            res.status(500).json({ error: 'Failed to remove person' });
        }
    }

    async getById(req, res) {
        try {
            const [[row]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
            if (!row) return res.status(404).json({ error: 'Record not found' });
            res.json({ success: true, data: row });
        } catch (err) {
            console.error('Expenses getById error:', err);
            res.status(500).json({ error: 'Failed to fetch record' });
        }
    }

    async getAudit(req, res) {
        try {
            const [rows] = await pool.query(
                `SELECT a.id, a.action, a.user_id, a.snapshot, a.created_at
                 FROM expense_audit_log a WHERE a.expense_id = ? ORDER BY a.id DESC`, [req.params.id]
            );
            res.json({ success: true, data: rows });
        } catch (err) {
            console.error('Expenses audit error:', err);
            res.status(500).json({ error: 'Failed to fetch audit log' });
        }
    }

    async create(req, res) {
        try {
            const b = req.body;
            const bad = validate(b, { requireCore: true });
            if (bad) return res.status(400).json({ error: bad });

            const person = await resolvePerson(pool, b);
            if (person === null) return res.status(400).json({ error: 'spent_by_id not found' });

            const isRecurring = b.is_recurring ? 1 : 0;
            const date = String(b.date);
            const status = b.status || 'approved';
            const approved = status === 'approved';

            const [result] = await pool.query(
                `INSERT INTO expenses (type, date, amount, currency, tax_amount, category, description, vendor,
                 spent_by, spent_by_id, payment_method, account, is_recurring, recurring_interval, next_due_date,
                 notes, reference, receipt_url, status, approved_by, approved_at, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    b.type || 'expense', date, parseFloat(b.amount), b.currency || 'INR',
                    parseFloat(b.tax_amount) || 0, (b.category || 'Other').trim(),
                    b.description || null, b.vendor || null, person.name, person.id,
                    b.payment_method || 'card', b.account || 'bank',
                    isRecurring, isRecurring ? b.recurring_interval : null,
                    isRecurring ? addInterval(date, b.recurring_interval) : null,
                    b.notes || null, b.reference || null, b.receipt_url || null,
                    status, approved ? req.user?.id || null : null, approved ? new Date() : null,
                    req.user?.id || null
                ]
            );

            const [[created]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
            await audit(pool, created.id, 'create', req.user?.id, created);
            res.status(201).json({ success: true, data: created });
        } catch (err) {
            console.error('Expenses create error:', err);
            res.status(500).json({ error: 'Failed to create record' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const b = req.body;
            const bad = validate(b, { requireCore: false });
            if (bad) return res.status(400).json({ error: bad });

            const [[before]] = await pool.query(`SELECT * FROM expenses WHERE id = ? AND ${LIVE}`, [id]);
            if (!before) return res.status(404).json({ error: 'Record not found' });

            // tax cap must hold against the stored amount when only tax_amount is patched
            if (b.tax_amount !== undefined && b.amount === undefined && parseFloat(b.tax_amount) > parseFloat(before.amount)) {
                return res.status(400).json({ error: 'tax_amount cannot exceed amount' });
            }

            const fields = [];
            const params = [];
            const plain = ['type', 'date', 'category', 'payment_method', 'account', 'currency'];
            for (const k of plain) {
                if (b[k] !== undefined) { fields.push(`${k} = ?`); params.push(b[k]); }
            }
            if (b.amount !== undefined)     { fields.push('amount = ?');     params.push(parseFloat(b.amount)); }
            if (b.tax_amount !== undefined) { fields.push('tax_amount = ?'); params.push(parseFloat(b.tax_amount) || 0); }
            for (const k of ['description', 'vendor', 'notes', 'reference', 'receipt_url']) {
                if (b[k] !== undefined) { fields.push(`${k} = ?`); params.push(b[k] || null); }
            }
            if (b.spent_by !== undefined || b.spent_by_id !== undefined) {
                const person = await resolvePerson(pool, b);
                if (person === null) return res.status(400).json({ error: 'spent_by_id not found' });
                fields.push('spent_by = ?', 'spent_by_id = ?');
                params.push(person.name, person.id);
            }
            if (b.is_recurring !== undefined) {
                const rec = b.is_recurring ? 1 : 0;
                const interval = rec ? (b.recurring_interval || before.recurring_interval) : null;
                if (rec && !INTERVALS.includes(interval)) return res.status(400).json({ error: 'recurring_interval is required when is_recurring is set' });
                const base = String(b.date || (before.date instanceof Date ? before.date.toLocaleDateString('en-CA') : before.date));
                fields.push('is_recurring = ?', 'recurring_interval = ?', 'next_due_date = ?');
                params.push(rec, interval, rec ? (before.next_due_date ? before.next_due_date : addInterval(base, interval)) : null);
            }
            if (b.status !== undefined && b.status !== before.status) {
                fields.push('status = ?', 'approved_by = ?', 'approved_at = ?');
                const ok = b.status === 'approved';
                params.push(b.status, ok ? req.user?.id || null : null, ok ? new Date() : null);
            }

            if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

            await pool.query(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
            const [[updated]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
            await audit(pool, updated.id, 'update', req.user?.id, { before, after: updated });

            res.json({ success: true, data: updated });
        } catch (err) {
            console.error('Expenses update error:', err);
            res.status(500).json({ error: 'Failed to update record' });
        }
    }

    async setStatus(req, res) {
        try {
            const status = req.path.endsWith('/approve') ? 'approved' : 'rejected';
            const [[row]] = await pool.query(`SELECT * FROM expenses WHERE id = ? AND ${LIVE}`, [req.params.id]);
            if (!row) return res.status(404).json({ error: 'Record not found' });
            await pool.query(
                'UPDATE expenses SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
                [status, req.user?.id || null, row.id]
            );
            await audit(pool, row.id, status === 'approved' ? 'approve' : 'reject', req.user?.id, { from: row.status });
            const [[updated]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [row.id]);
            res.json({ success: true, data: updated });
        } catch (err) {
            console.error('Expenses setStatus error:', err);
            res.status(500).json({ error: 'Failed to update status' });
        }
    }

    // Soft delete: the row stays, hidden from lists and totals, restorable.
    async softDelete(ids, userId) {
        const marks = ids.map(() => '?').join(',');
        const [rows] = await pool.query(`SELECT * FROM expenses WHERE id IN (${marks}) AND ${LIVE}`, ids);
        if (!rows.length) return 0;
        const liveIds = rows.map(r => r.id);
        await pool.query(
            `UPDATE expenses SET deleted_at = NOW(), deleted_by = ? WHERE id IN (${liveIds.map(() => '?').join(',')})`,
            [userId || null, ...liveIds]
        );
        for (const r of rows) await audit(pool, r.id, 'delete', userId, r);
        return rows.length;
    }

    async delete(req, res) {
        try {
            const n = await this.softDelete([req.params.id], req.user?.id);
            if (!n) return res.status(404).json({ error: 'Record not found' });
            res.json({ success: true });
        } catch (err) {
            console.error('Expenses delete error:', err);
            res.status(500).json({ error: 'Failed to delete record' });
        }
    }

    async bulkDelete(req, res) {
        try {
            const ids = (Array.isArray(req.body.ids) ? req.body.ids : []).map(Number).filter(Number.isInteger);
            if (!ids.length) return res.status(400).json({ error: 'ids array required' });
            if (ids.length > MAX_BULK) return res.status(400).json({ error: `Cannot delete more than ${MAX_BULK} records at once` });
            const deleted = await this.softDelete(ids, req.user?.id);
            res.json({ success: true, deleted });
        } catch (err) {
            console.error('Expenses bulkDelete error:', err);
            res.status(500).json({ error: 'Failed to bulk delete' });
        }
    }

    async restore(req, res) {
        try {
            const [result] = await pool.query(
                'UPDATE expenses SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
                [req.params.id]
            );
            if (!result.affectedRows) return res.status(404).json({ error: 'Deleted record not found' });
            await audit(pool, Number(req.params.id), 'restore', req.user?.id, null);
            res.json({ success: true });
        } catch (err) {
            console.error('Expenses restore error:', err);
            res.status(500).json({ error: 'Failed to restore record' });
        }
    }

    // Create the copies that recurring templates owe up to today (IST). Called daily by expenseRecurringWorker.
    // Each copy is a normal one-off row (is_recurring = 0) linked by recurring_parent_id.
    async generateRecurring() {
        const t = today();
        const [templates] = await pool.query(
            `SELECT * FROM expenses WHERE ${LIVE} AND is_recurring = 1 AND status = 'approved'
             AND next_due_date IS NOT NULL AND next_due_date <= ?`, [t]
        );
        let created = 0;
        for (const tpl of templates) {
            let due = tpl.next_due_date instanceof Date ? tpl.next_due_date.toLocaleDateString('en-CA') : String(tpl.next_due_date);
            for (let i = 0; i < 24 && due <= t; i++) { // cap catch-up if the worker was down for ages
                const [r] = await pool.query(
                    `INSERT INTO expenses (type, date, amount, currency, tax_amount, category, description, vendor,
                     spent_by, spent_by_id, payment_method, account, is_recurring, notes, reference,
                     status, approved_at, recurring_parent_id, created_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'approved', NOW(), ?, ?)`,
                    [tpl.type, due, tpl.amount, tpl.currency, tpl.tax_amount, tpl.category, tpl.description, tpl.vendor,
                     tpl.spent_by, tpl.spent_by_id, tpl.payment_method, tpl.account, tpl.notes, tpl.reference,
                     tpl.id, tpl.created_by]
                );
                await audit(pool, r.insertId, 'create', null, { generated_from: tpl.id, date: due });
                created++;
                due = addInterval(due, tpl.recurring_interval);
            }
            await pool.query('UPDATE expenses SET next_due_date = ? WHERE id = ?', [due, tpl.id]);
        }
        return created;
    }
}

const controller = new ExpenseController();
// Express passes handlers unbound; delete/bulkDelete use this.softDelete.
for (const m of ['delete', 'bulkDelete']) controller[m] = controller[m].bind(controller);

module.exports = controller;
module.exports._test = { validate, addInterval }; // test seam for scripts/test-expense-rules.js
