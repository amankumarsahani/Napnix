const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/expense.controller');
const { auth, isAdmin } = require('../middleware/auth');

router.use(auth);
router.use(isAdmin);

router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);
router.post('/bulk-delete', ctrl.bulkDelete);

module.exports = router;
