const express = require('express');
const studentController = require('../controllers/student.controller');
const { authenticate, authorizeSelf } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const { updateStudentSchema } = require('../validations/student.validation');

const router = express.Router();

// All student routes require authentication
router.use(authenticate);
// GET /api/students/me - Lấy thông tin cá nhân
router.get('/me', studentController.getMe);

// GET /api/students/me/stats - Lấy thống kê bản thân
router.get('/me/stats', (req, res, next) => {
  req.params.id = req.user.student_id;
  studentController.getStats(req, res, next);
});

// GET /api/students/me/schedule - Lấy lịch học bản thân
router.get('/me/schedule', (req, res, next) => {
  req.params.id = req.user.student_id;
  studentController.getSchedule(req, res, next);
});

// Các route dưới đây yêu cầu kiểm tra quyền sở hữu (Self-authorization)
router.use('/:id', authorizeSelf);
// GET /api/students/:id
router.get('/:id', studentController.getById);
// PUT /api/students/:id
router.put('/:id', updateStudentSchema, validate, studentController.update);
// GET /api/students/:id/stats
router.get('/:id/stats', studentController.getStats);
// GET /api/students/:id/schedule
router.get('/:id/schedule', studentController.getSchedule);

module.exports = router;
