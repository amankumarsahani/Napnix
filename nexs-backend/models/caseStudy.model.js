const { pool } = require('../config/database');

const CaseStudyModel = {
    // List. Public callers get published only; admins pass status='all'.
    async findAll(filters = {}) {
        let query = 'SELECT * FROM case_studies WHERE 1=1';
        const params = [];

        if (filters.status && filters.status !== 'all') {
            query += ' AND status = ?';
            params.push(filters.status);
        } else if (!filters.status) {
            query += " AND status = 'published'";
        }

        if (filters.search) {
            query += ' AND (title LIKE ? OR summary LIKE ?)';
            const term = `%${filters.search}%`;
            params.push(term, term);
        }

        query += ' ORDER BY sort_order ASC, created_at DESC';

        const [rows] = await pool.query(query, params);
        return rows.map(r => this._mapRow(r));
    },

    async count(filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM case_studies WHERE 1=1';
        const params = [];
        if (filters.status && filters.status !== 'all') {
            query += ' AND status = ?';
            params.push(filters.status);
        } else if (!filters.status) {
            query += " AND status = 'published'";
        }
        const [rows] = await pool.query(query, params);
        return rows[0].total;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM case_studies WHERE id = ?', [id]);
        return this._mapRow(rows[0]);
    },

    async findBySlug(slug) {
        const [rows] = await pool.query('SELECT * FROM case_studies WHERE slug = ?', [slug]);
        return this._mapRow(rows[0]);
    },

    async create(data) {
        const v = this._normalizeInput(data);
        const [result] = await pool.query(
            `INSERT INTO case_studies
                (slug, title, category, accent, summary, tech, problem, solution, system_flow, impact, quote_text, quote_author, quote_role, status, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [v.slug, v.title, v.category, v.accent, v.summary,
             JSON.stringify(v.tech), JSON.stringify(v.problem), JSON.stringify(v.solution),
             JSON.stringify(v.system_flow), JSON.stringify(v.impact),
             v.quote_text, v.quote_author, v.quote_role, v.status, v.sort_order]
        );
        return this.findById(result.insertId);
    },

    async update(id, data) {
        const v = this._normalizeInput(data, true);
        const sets = [];
        const params = [];
        const jsonCols = ['tech', 'problem', 'solution', 'system_flow', 'impact'];
        const cols = ['slug', 'title', 'category', 'accent', 'summary', ...jsonCols,
            'quote_text', 'quote_author', 'quote_role', 'status', 'sort_order'];

        for (const col of cols) {
            if (v[col] === undefined) continue;
            sets.push(`${col} = ?`);
            params.push(jsonCols.includes(col) ? JSON.stringify(v[col]) : v[col]);
        }

        if (!sets.length) return this.findById(id);
        params.push(id);
        await pool.query(`UPDATE case_studies SET ${sets.join(', ')} WHERE id = ?`, params);
        return this.findById(id);
    },

    async delete(id) {
        const [result] = await pool.query('DELETE FROM case_studies WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    // Accept both the nested/camel shape (systemFlow, quote{}) and flat columns.
    // On update (partial=true) only keys that are present are returned.
    _normalizeInput(data, partial = false) {
        const out = {};
        const set = (key, val, fallback) => {
            if (val !== undefined) out[key] = val;
            else if (!partial) out[key] = fallback;
        };
        set('slug', data.slug, '');
        set('title', data.title, '');
        set('category', data.category, null);
        set('accent', data.accent, 'amber');
        set('summary', data.summary, '');
        set('tech', data.tech, []);
        set('problem', data.problem, []);
        set('solution', data.solution, []);
        set('system_flow', data.system_flow !== undefined ? data.system_flow : data.systemFlow, []);
        set('impact', data.impact, []);

        const quote = data.quote || {};
        const qText = data.quote_text !== undefined ? data.quote_text : quote.text;
        const qAuthor = data.quote_author !== undefined ? data.quote_author : quote.author;
        const qRole = data.quote_role !== undefined ? data.quote_role : quote.role;
        set('quote_text', qText, null);
        set('quote_author', qAuthor, null);
        set('quote_role', qRole, null);

        set('status', data.status, 'published');
        set('sort_order', data.sort_order !== undefined ? data.sort_order : data.sortOrder, 0);
        return out;
    },

    _mapRow(row) {
        if (!row) return null;
        const parse = (val) => (typeof val === 'string' ? JSON.parse(val || '[]') : (val || []));
        return {
            id: row.id,
            slug: row.slug,
            title: row.title,
            category: row.category,
            accent: row.accent,
            summary: row.summary,
            tech: parse(row.tech),
            problem: parse(row.problem),
            solution: parse(row.solution),
            systemFlow: parse(row.system_flow),
            impact: parse(row.impact),
            quote: {
                text: row.quote_text || '',
                author: row.quote_author || '',
                role: row.quote_role || '',
            },
            status: row.status,
            sortOrder: row.sort_order,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    },
};

module.exports = CaseStudyModel;
