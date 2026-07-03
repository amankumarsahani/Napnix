const PortfolioModel = require('../models/portfolio.model');

// Turn a title into a URL-safe slug.
function slugify(str) {
    return String(str)
        .toLowerCase()
        .replace(/—/g, '-')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const PortfolioController = {
    // GET /api/portfolio  — public list (admins see all via ?status=all)
    async getAll(req, res) {
        try {
            const filters = {
                category: req.query.category,
                featured: req.query.featured === 'true' ? true : undefined,
                search: req.query.search,
                page: req.query.page,
                limit: req.query.limit,
                status: req.user ? (req.query.status || 'all') : 'published',
            };

            const projects = await PortfolioModel.findAll(filters);
            const total = await PortfolioModel.count(filters);
            const categories = await PortfolioModel.getCategories();

            res.json({ success: true, projects, categories, total });
        } catch (error) {
            console.error('Get portfolio error:', error);
            res.status(500).json({ error: 'Failed to fetch portfolio' });
        }
    },

    // GET /api/portfolio/stats  — admin dashboard counts
    async getStats(req, res) {
        try {
            const total = await PortfolioModel.count({ status: 'all' });
            const published = await PortfolioModel.count({ status: 'published' });
            const drafts = await PortfolioModel.count({ status: 'draft' });
            res.json({ success: true, stats: { total, published, drafts } });
        } catch (error) {
            console.error('Portfolio stats error:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    },

    async getBySlug(req, res) {
        try {
            const project = await PortfolioModel.findBySlug(req.params.slug);
            if (!project) return res.status(404).json({ error: 'Project not found' });
            res.json({ success: true, project });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch project' });
        }
    },

    async getById(req, res) {
        try {
            const project = await PortfolioModel.findById(req.params.id);
            if (!project) return res.status(404).json({ error: 'Project not found' });
            res.json({ success: true, project });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch project' });
        }
    },

    async create(req, res) {
        try {
            const data = { ...req.body };
            if (!data.title) return res.status(400).json({ error: 'Title is required' });
            if (!data.slug) data.slug = slugify(data.title);
            const project = await PortfolioModel.create(data);
            res.status(201).json({ success: true, project });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'A project with this slug already exists' });
            }
            console.error('Create portfolio error:', error);
            res.status(500).json({ error: 'Failed to create project' });
        }
    },

    async update(req, res) {
        try {
            const existing = await PortfolioModel.findById(req.params.id);
            if (!existing) return res.status(404).json({ error: 'Project not found' });
            const project = await PortfolioModel.update(req.params.id, req.body);
            res.json({ success: true, project });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'A project with this slug already exists' });
            }
            console.error('Update portfolio error:', error);
            res.status(500).json({ error: 'Failed to update project' });
        }
    },

    async delete(req, res) {
        try {
            const ok = await PortfolioModel.delete(req.params.id);
            if (!ok) return res.status(404).json({ error: 'Project not found' });
            res.json({ success: true });
        } catch (error) {
            console.error('Delete portfolio error:', error);
            res.status(500).json({ error: 'Failed to delete project' });
        }
    },
};

module.exports = PortfolioController;
