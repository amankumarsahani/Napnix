const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/team.controller');
const { auth, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get statistics
router.get('/stats', TeamController.getStats);

// CRUD routes
router.get('/', TeamController.getAll);
router.get('/:id', TeamController.getById);
// Writes create logins and set roles: admin only (any signed-in user could mint an admin before)
router.post('/', isAdmin, TeamController.create);
router.put('/:id', isAdmin, TeamController.update);
router.delete('/:id', isAdmin, TeamController.delete);

module.exports = router;
