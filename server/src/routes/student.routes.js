const express = require('express');
const studentController = require('../controllers/student.controller');
const { authenticate, authorizeSelf } = require('../middleware/auth.middleware');

const router = express.Router();

// All student routes require authentication
router.use(authenticate);
// GET /api/students/me - Lấy thông tin cá nhân
router.get('/me', studentController.getMe);
// Các route dưới đây yêu cầu kiểm tra quyền sở hữu (Self-authorization)
router.use('/:id', authorizeSelf);
// GET /api/students/:id
router.get('/:id', studentController.getById);
// PUT /api/students/:id
router.put('/:id', studentController.update);
// GET /api/students/:id/stats
router.get('/:id/stats', studentController.getStats);
// GET /api/students/:id/schedule
router.get('/:id/schedule', studentController.getSchedule);

module.exports = router;
