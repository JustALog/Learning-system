const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const enrollmentController = require('../controllers/enrollment.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All enrollment routes require authentication
router.use(authenticate);

/**
 * POST /api/enrollments - Đăng ký học phần
 */
router.post(
  '/',
  [
    body('section_id')
      .isInt()
      .withMessage('ID lớp học phần là bắt buộc'),
    validate,
  ],
  enrollmentController.enroll
);

/**
 * PUT /api/enrollments/:id/cancel - Hủy đăng ký
 */
router.put(
  '/:id/cancel',
  [
    body('cancel_reason')
      .optional()
      .trim()
      .isLength({ max: 255 }),
    validate,
  ],
  enrollmentController.cancel
);

/**
 * GET /api/enrollments/my - Lấy danh sách đăng ký của sinh viên
 */
router.get('/my', enrollmentController.getMyEnrollments);

module.exports = router;
