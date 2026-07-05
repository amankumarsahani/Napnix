const express = require('express');
const router = express.Router();
const CaseStudyController = require('../controllers/caseStudy.controller');
const { auth, optionalAuth } = require('../middleware/auth');

// Public
router.get('/', optionalAuth, CaseStudyController.getAll);
router.get('/slug/:slug', CaseStudyController.getBySlug);

// Admin
router.get('/stats', auth, CaseStudyController.getStats);
router.get('/:id', auth, CaseStudyController.getById);
router.post('/', auth, CaseStudyController.create);
router.put('/:id', auth, CaseStudyController.update);
router.delete('/:id', auth, CaseStudyController.delete);

module.exports = router;
