const { pool } = require('../config/database');

const PortfolioModel = {
    // List projects. Public callers get published only; admins pass status='all'.
    async findAll(filters = {}) {
        let query = 'SELECT * FROM portfolio_projects WHERE 1=1';
        const params = [];

        if (filters.status && filters.status !== 'all') {
            query += ' AND status = ?';
            params.push(filters.status);
        } else if (!filters.status) {
            query += " AND status = 'published'";
        }

        if (filters.category && filters.category !== 'All') {
            query += ' AND category = ?';
            params.push(filters.category);
        }

        if (filters.featured !== undefined) {
            query += ' AND featured = ?';
            params.push(filters.featured ? 1 : 0);
        }

        if (filters.search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            const term = `%${filters.search}%`;
            params.push(term, term);
        }

        query += ' ORDER BY sort_order ASC, created_at DESC';

        if (filters.limit) {
            const limit = parseInt(filters.limit) || 20;
            const page = parseInt(filters.page) || 1;
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, (page - 1) * limit);
        }

        const [rows] = await pool.query(query, params);
        return rows.map(r => this._mapRow(r));
    },

    async count(filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM portfolio_projects WHERE 1=1';
        const params = [];

        if (filters.status && filters.status !== 'all') {
            query += ' AND status = ?';
            params.push(filters.status);
        } else if (!filters.status) {
            query += " AND status = 'published'";
        }

        if (filters.category && filters.category !== 'All') {
            query += ' AND category = ?';
            params.push(filters.category);
        }

        if (filters.search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            const term = `%${filters.search}%`;
            params.push(term, term);
        }

        const [rows] = await pool.query(query, params);
        return rows[0].total;
    },

    // Distinct published categories (for the site filter bar).
    async getCategories() {
        const [rows] = await pool.query(
            "SELECT DISTINCT category FROM portfolio_projects WHERE status = 'published' ORDER BY category"
        );
        return rows.map(r => r.category);
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM portfolio_projects WHERE id = ?', [id]);
        return this._mapRow(rows[0]);
    },

    async findBySlug(slug) {
        const [rows] = await pool.query('SELECT * FROM portfolio_projects WHERE slug = ?', [slug]);
        return this._mapRow(rows[0]);
    },

    async create(data) {
        const {
            title, slug, category = 'Web Platform', description = '',
            tags = [], tech_stack = [], metric = 'Live', client = null,
            industry = null, image_url = null, accent = null, size = 'small',
            status = 'published', featured = 0, sort_order = 0,
        } = data;

        const [result] = await pool.query(
            `INSERT INTO portfolio_projects
                (title, slug, category, description, tags, tech_stack, metric, client, industry, image_url, accent, size, status, featured, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, slug, category, description, JSON.stringify(tags), JSON.stringify(tech_stack),
             metric, client, industry, image_url, accent, size, status, featured ? 1 : 0, sort_order]
        );
        return this.findById(result.insertId);
    },

    async update(id, data) {
        const allowed = ['title', 'slug', 'category', 'description', 'tags', 'tech_stack',
            'metric', 'client', 'industry', 'image_url', 'accent', 'size', 'status', 'featured', 'sort_order'];
        const sets = [];
        const params = [];

        for (const key of allowed) {
            if (data[key] === undefined) continue;
            if (key === 'tags' || key === 'tech_stack') {
                sets.push(`${key} = ?`);
                params.push(JSON.stringify(data[key]));
            } else if (key === 'featured') {
                sets.push('featured = ?');
                params.push(data.featured ? 1 : 0);
            } else {
                sets.push(`${key} = ?`);
                params.push(data[key]);
            }
        }

        if (!sets.length) return this.findById(id);

        params.push(id);
        await pool.query(`UPDATE portfolio_projects SET ${sets.join(', ')} WHERE id = ?`, params);
        return this.findById(id);
    },

    async delete(id) {
        const [result] = await pool.query('DELETE FROM portfolio_projects WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    _mapRow(row) {
        if (!row) return null;
        const parse = (v) => (typeof v === 'string' ? JSON.parse(v || '[]') : (v || []));
        return {
            ...row,
            featured: !!row.featured,
            tags: parse(row.tags),
            tech_stack: parse(row.tech_stack),
        };
    },
};

module.exports = PortfolioModel;
