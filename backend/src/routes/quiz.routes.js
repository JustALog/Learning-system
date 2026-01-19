const express = require('express');
const { createQuiz, addQuestion, getQuiz, submitQuiz } = require('../controllers/quiz.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('INSTRUCTOR', 'ADMIN'), createQuiz);
router.post('/question', authenticateToken, authorizeRoles('INSTRUCTOR', 'ADMIN'), addQuestion);
router.get('/:id', authenticateToken, getQuiz);
router.post('/submit', authenticateToken, submitQuiz);

module.exports = router;
