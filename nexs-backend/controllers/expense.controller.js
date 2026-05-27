const { pool } = require('../config/database');

class ExpenseController {
    async getAll(req, res) {
        try {
            const {
                page = 1, limit = 50,
                date_from, date_to,
                category, payment_method,
                search, is_recurring
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            const conditions = [];
            const params = [];

            if (date_from) { conditions.push('date >= ?'); params.push(date_from); }
            if (date_to)   { conditions.push('date <= ?'); params.push(date_to); }
            if (category)  { conditions.push('category = ?'); params.push(category); }
            if (payment_method) { conditions.push('payment_method = ?'); params.push(payment_method); }
            if (is_recurring !== undefined && is_recurring !== '') {
                conditions.push('is_recurring = ?');
                params.push(is_recurring === 'true' || is_recurring === '1' ? 1 : 0);
            }
            if (search) {
                conditions.push('(vendor LIKE ? OR description LIKE ? OR notes LIKE ?)');
                const like = `%${search}%`;
                params.push(like, like, like);
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
            res.status(500).json({ error: 'Failed to fetch expenses' });
        }
    }

    async getStats(req, res) {
        try {
            const now = new Date();
            const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
            const yearStart  = `${now.getFullYear()}-01-01`;

            const [[monthRow]] = await pool.query(
                'SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date >= ?',
                [monthStart]
            );
            const [[ytdRow]] = await pool.query(
                'SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date >= ?',
                [yearStart]
            );

            const [byCategory] = await pool.query(
                `SELECT category, COALESCE(SUM(amount),0) as total, COUNT(*) as count
                 FROM expenses GROUP BY category ORDER BY total DESC`
            );

            const [monthlyTrend] = await pool.query(
                `SELECT DATE_FORMAT(date, '%Y-%m') as month, COALESCE(SUM(amount),0) as total
                 FROM expenses
                 WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                 GROUP BY month ORDER BY month ASC`
            );

            const [[recurringRow]] = await pool.query(
                `SELECT COALESCE(SUM(
                    CASE recurring_interval
                        WHEN 'monthly'   THEN amount
                        WHEN 'quarterly' THEN amount / 3
                        WHEN 'yearly'    THEN amount / 12
                        ELSE amount
                    END
                 ),0) as monthly_total
                 FROM expenses WHERE is_recurring = 1`
            );

            const [allCategories] = await pool.query(
                'SELECT DISTINCT category FROM expenses ORDER BY category'
            );

            res.json({
                success: true,
                data: {
                    thisMonth: parseFloat(monthRow.total),
                    ytd: parseFloat(ytdRow.total),
                    topCategory: byCategory[0]?.category || null,
                    recurringPerMonth: parseFloat(recurringRow.monthly_total),
                    byCategory: byCategory.map(r => ({ ...r, total: parseFloat(r.total) })),
                    monthlyTrend: monthlyTrend.map(r => ({ ...r, total: parseFloat(r.total) })),
                    allCategories: allCategories.map(r => r.category)
                }
            });
        } catch (err) {
            console.error('Expenses getStats error:', err);
            res.status(500).json({ error: 'Failed to fetch expense stats' });
        }
    }

    async getById(req, res) {
        try {
            const [[row]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
            if (!row) return res.status(404).json({ error: 'Expense not found' });
            res.json({ success: true, data: row });
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch expense' });
        }
    }

    async create(req, res) {
        try {
            const {
                date, amount, category = 'Other', description,
                vendor, payment_method = 'card',
                is_recurring = 0, recurring_interval, notes
            } = req.body;

            if (!date || amount === undefined) {
                return res.status(400).json({ error: 'date and amount are required' });
            }

            const [result] = await pool.query(
                `INSERT INTO expenses (date, amount, category, description, vendor, payment_method,
                 is_recurring, recurring_interval, notes, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    date, parseFloat(amount), category, description || null,
                    vendor || null, payment_method,
                    is_recurring ? 1 : 0,
                    is_recurring && recurring_interval ? recurring_interval : null,
                    notes || null,
                    req.user?.id || null
                ]
            );

            const [[created]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
            res.status(201).json({ success: true, data: created });
        } catch (err) {
            console.error('Expenses create error:', err);
            res.status(500).json({ error: 'Failed to create expense' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                date, amount, category, description,
                vendor, payment_method, is_recurring, recurring_interval, notes
            } = req.body;

            const fields = [];
            const params = [];

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

            if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

            await pool.query(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
            const [[updated]] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
            if (!updated) return res.status(404).json({ error: 'Expense not found' });

            res.json({ success: true, data: updated });
        } catch (err) {
            console.error('Expenses update error:', err);
            res.status(500).json({ error: 'Failed to update expense' });
        }
    }

    async delete(req, res) {
        try {
            const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Expense not found' });
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete expense' });
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
            res.status(500).json({ error: 'Failed to bulk delete expenses' });
        }
    }
}

module.exports = new ExpenseController();
