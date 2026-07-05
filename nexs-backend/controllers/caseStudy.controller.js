const CaseStudyModel = require('../models/caseStudy.model');

// Turn a title into a URL-safe slug.
function slugify(str) {
    return String(str)
        .toLowerCase()
        .replace(/—/g, '-')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const CaseStudyController = {
    // GET /api/case-studies  — public list (admins see all via ?status=all)
    async getAll(req, res) {
        try {
            const filters = {
                search: req.query.search,
                status: req.user ? (req.query.status || 'all') : 'published',
            };
            const caseStudies = await CaseStudyModel.findAll(filters);
            const total = await CaseStudyModel.count(filters);
            res.json({ success: true, caseStudies, total });
        } catch (error) {
            console.error('Get case studies error:', error);
            res.status(500).json({ error: 'Failed to fetch case studies' });
        }
    },

    // GET /api/case-studies/stats
    async getStats(req, res) {
        try {
            const total = await CaseStudyModel.count({ status: 'all' });
            const published = await CaseStudyModel.count({ status: 'published' });
            const drafts = await CaseStudyModel.count({ status: 'draft' });
            res.json({ success: true, stats: { total, published, drafts } });
        } catch (error) {
            console.error('Case study stats error:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    },

    async getBySlug(req, res) {
        try {
            const caseStudy = await CaseStudyModel.findBySlug(req.params.slug);
            if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });
            res.json({ success: true, caseStudy });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch case study' });
        }
    },

    async getById(req, res) {
        try {
            const caseStudy = await CaseStudyModel.findById(req.params.id);
            if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });
            res.json({ success: true, caseStudy });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch case study' });
        }
    },

    async create(req, res) {
        try {
            const data = { ...req.body };
            if (!data.title) return res.status(400).json({ error: 'Title is required' });
            if (!data.slug) data.slug = slugify(data.title);
            const caseStudy = await CaseStudyModel.create(data);
            res.status(201).json({ success: true, caseStudy });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'A case study with this slug already exists' });
            }
            console.error('Create case study error:', error);
            res.status(500).json({ error: 'Failed to create case study' });
        }
    },

    async update(req, res) {
        try {
            const existing = await CaseStudyModel.findById(req.params.id);
            if (!existing) return res.status(404).json({ error: 'Case study not found' });
            const caseStudy = await CaseStudyModel.update(req.params.id, req.body);
            res.json({ success: true, caseStudy });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'A case study with this slug already exists' });
            }
            console.error('Update case study error:', error);
            res.status(500).json({ error: 'Failed to update case study' });
        }
    },

    async delete(req, res) {
        try {
            const ok = await CaseStudyModel.delete(req.params.id);
            if (!ok) return res.status(404).json({ error: 'Case study not found' });
            res.json({ success: true });
        } catch (error) {
            console.error('Delete case study error:', error);
            res.status(500).json({ error: 'Failed to delete case study' });
        }
    },
};

module.exports = CaseStudyController;
