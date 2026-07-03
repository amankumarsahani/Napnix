const express = require('express');
const router = express.Router();
const PortfolioController = require('../controllers/portfolio.controller');
const { auth, optionalAuth } = require('../middleware/auth');

// Public
router.get('/', optionalAuth, PortfolioController.getAll);
router.get('/slug/:slug', PortfolioController.getBySlug);

// Admin
router.get('/stats', auth, PortfolioController.getStats);
router.get('/:id', auth, PortfolioController.getById);
router.post('/', auth, PortfolioController.create);
router.put('/:id', auth, PortfolioController.update);
router.delete('/:id', auth, PortfolioController.delete);

module.exports = router;
