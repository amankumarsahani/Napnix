const { pool } = require('../config/database');

class ExpenseController {
    async getAll(req, res) {
        try {
            const {
                page = 1, limit = 50,
                type, date_from, date_to,
                category, payment_method,
                search, is_recurring
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            const conditions = [];
            const params = [];

            if (type)          { conditions.push('type = ?');            params.push(type); }
            if (date_from)     { conditions.push('date >= ?');           params.push(date_from); }
            if (date_to)       { conditions.push('date <= ?');           params.push(date_to); }
            if (category)      { conditions.push('category = ?');        params.push(category); }
            if (payment_method){ conditions.push('payment_method = ?');  params.push(payment_method); }
            if (is_recurring !== undefined && is_recurring !== '') {
                conditions.push('is_recurring = ?');
                params.push(is_recurring === 'true' || is_recurring === '1' ? 1 : 0);
            }
            if (search) {
                conditions.push('(vendor LIKE ? OR description LIKE ? OR notes LIKE ? OR reference LIKE ?)');
                const like = `%${search}%`;
                params.push(like, like, like, like);
            }

            const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) as total FROM expenses ${where}`, params
            );
            const [rows] = await pool.query(
                `SELECT * FROM expenses ${where} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`,
                [...params, parseInt(limit), offset]
            );

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        } catch (err) {
            console.error('Expenses getAll error:', err);
            res.status(500).json({ error: 'Failed to fetch records' });
        }
    }

    async getStats(req, res) {
        try {
            const now = new Date();
            const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
            const yearStart  = `${now.getFullYear()}-01-01`;

            // This month totals by type
            const [monthRows] = await pool.query(
                `SELECT type, COALESCE(SUM(amount),0) as total FROM expenses
                 WHERE date >= ? GROUP BY type`, [monthStart]
            );
            const monthByType = Object.fromEntries(monthRows.map(r => [r.type, parseFloat(r.total)]));

            // YTD totals by type
            const [ytdRows] = await pool.query(
                `SELECT type, COALESCE(SUM(amount),0) as total FROM expenses
                 WHERE date >= ? GROUP BY type`, [yearStart]
            );
            const ytdByType = Object.fromEntries(ytdRows.map(r => [r.type, parseFloat(r.total)]));

            // By category (expenses)
            const [expByCategory] = await pool.query(
                `SELECT category, COALESCE(SUM(amount),0) as total, COUNT(*) as count
                 FROM expenses WHERE type = 'expense' GROUP BY category ORDER BY total DESC`
            );
            // By category (deposits)
            const [depByCategory] = await pool.query(
                `SELECT category, COALESCE(SUM(amount),0) as total, COUNT(*) as count
                 FROM expenses WHERE type = 'deposit' GROUP BY category ORDER BY total DESC`
            );

            // Monthly trend (last 12 months, both types)
            const [monthlyTrend] = await pool.query(
                `SELECT DATE_FORMAT(date,'%Y-%m') as month, type, COALESCE(SUM(amount),0) as total
                 FROM expenses
                 WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                 GROUP BY month, type ORDER BY month ASC`
            );
            // Merge into { month, expense, deposit }
            const trendMap = {};
            for (const r of monthlyTrend) {
                if (!trendMap[r.month]) trendMap[r.month] = { month: r.month, expense: 0, deposit: 0 };
                trendMap[r.month][r.type] = parseFloat(r.total);
            }
            const trend = Object.values(trendMap).sort((a, b) => a.month.localeCompare(b.month));

            // Recurring monthly expense equivalent
            const [[recurringRow]] = await pool.query(
                `SELECT COALESCE(SUM(
                    CASE recurring_interval
                        WHEN 'monthly'   THEN amount
                        WHEN 'quarterly' THEN amount / 3
                        WHEN 'yearly'    THEN amount / 12
                        ELSE amount
                    END
                 ),0) as monthly_total
                 FROM expenses WHERE is_recurring = 1 AND type = 'expense'`
            );

            const [allCategories] = await pool.query(
                'SELECT DISTINCT category, type FROM expenses ORDER BY type, category'
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
                        byCategory: expByCategory.map(r => ({ ...r, total: parseFloat(r.total) })),
                    },
                    deposit: {
                        thisMonth: monthByType['deposit'] || 0,
                        ytd: depYtd,
                        topCategory: depByCategory[0]?.category || null,
                        byCategory: depByCategory.map(r => ({ ...r, total: parseFloat(r.total) })),
                    },
                    net: {
                        thisMonth: (monthByType['deposit'] || 0) - (monthByType['expense'] || 0),
                        ytd: depYtd - expYtd,
                    },
                    monthlyTrend: trend,
                    allExpenseCategories: allCategories.filter(r => r.type === 'expense').map(r => r.category),
                    allDepositCategories: allCategories.filter(r => r.type === 'deposit').map(r => r.category),
                }
            });
        } catch (err) {
            console.error('Expenses getStats error:', err);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }

    async getById(req, res) {
        try {
            const [[row]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
            if (!row) return res.status(404).json({ error: 'Record not found' });
            res.json({ success: true, data: row });
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch record' });
        }
    }

    async create(req, res) {
        try {
            const {
                type = 'expense',
                date, amount, category = 'Other', description,
                vendor, payment_method = 'card',
                is_recurring = 0, recurring_interval, notes, reference
            } = req.body;

            if (!date || amount === undefined) {
                return res.status(400).json({ error: 'date and amount are required' });
            }

            const [result] = await pool.query(
                `INSERT INTO expenses (type, date, amount, category, description, vendor, payment_method,
                 is_recurring, recurring_interval, notes, reference, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    type, date, parseFloat(amount), category,
                    description || null, vendor || null, payment_method,
                    is_recurring ? 1 : 0,
                    is_recurring && recurring_interval ? recurring_interval : null,
                    notes || null, reference || null,
                    req.user?.id || null
                ]
            );

            const [[created]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
            res.status(201).json({ success: true, data: created });
        } catch (err) {
            console.error('Expenses create error:', err);
            res.status(500).json({ error: 'Failed to create record' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                type, date, amount, category, description,
                vendor, payment_method, is_recurring, recurring_interval,
                notes, reference
            } = req.body;

            const fields = [];
            const params = [];

            if (type !== undefined)              { fields.push('type = ?');               params.push(type); }
            if (date !== undefined)              { fields.push('date = ?');               params.push(date); }
            if (amount !== undefined)            { fields.push('amount = ?');             params.push(parseFloat(amount)); }
            if (category !== undefined)          { fields.push('category = ?');           params.push(category); }
            if (description !== undefined)       { fields.push('description = ?');        params.push(description || null); }
            if (vendor !== undefined)            { fields.push('vendor = ?');             params.push(vendor || null); }
            if (payment_method !== undefined)    { fields.push('payment_method = ?');     params.push(payment_method); }
            if (is_recurring !== undefined) {
                const rec = is_recurring ? 1 : 0;
                fields.push('is_recurring = ?'); params.push(rec);
                fields.push('recurring_interval = ?');
                params.push(rec && recurring_interval ? recurring_interval : null);
            }
            if (notes !== undefined)             { fields.push('notes = ?');              params.push(notes || null); }
            if (reference !== undefined)         { fields.push('reference = ?');          params.push(reference || null); }

            if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

            await pool.query(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
            const [[updated]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
            if (!updated) return res.status(404).json({ error: 'Record not found' });

            res.json({ success: true, data: updated });
        } catch (err) {
            console.error('Expenses update error:', err);
            res.status(500).json({ error: 'Failed to update record' });
        }
    }

    async delete(req, res) {
        try {
            const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete record' });
        }
    }

    async bulkDelete(req, res) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || !ids.length) {
                return res.status(400).json({ error: 'ids array required' });
            }
            const placeholders = ids.map(() => '?').join(',');
            await pool.query(`DELETE FROM expenses WHERE id IN (${placeholders})`, ids);
            res.json({ success: true, deleted: ids.length });
        } catch (err) {
            res.status(500).json({ error: 'Failed to bulk delete' });
        }
    }
}

module.exports = new ExpenseController();
