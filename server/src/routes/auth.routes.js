const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validate');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('student_id')
      .trim()
      .notEmpty()
      .withMessage('Mã sinh viên là bắt buộc')
      .isLength({ max: 10 })
      .withMessage('Mã sinh viên tối đa 10 ký tự'),
    body('full_name')
      .trim()
      .notEmpty()
      .withMessage('Họ và tên là bắt buộc')
      .isLength({ max: 100 }),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('date_of_birth')
      .optional()
      .isDate()
      .withMessage('Ngày sinh không hợp lệ'),
    body('major').optional().trim(),
    body('academic_year')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Năm nhập học không hợp lệ'),
    validate,
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  // authLimiter,
  [
    body('identifier').trim().notEmpty().withMessage('Mã đăng nhập là bắt buộc'),
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
    body('role').optional().isIn(['student', 'admin']).withMessage('Vai trò không hợp lệ'),
    validate,
  ],
  authController.login
);

// GET /api/auth/me
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
