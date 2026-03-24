const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const courseController = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All course routes require authentication
router.use(authenticate);

/**
 * GET /api/courses
 */
router.get('/', courseController.getAll);

/**
 * GET /api/courses/:id
 */
router.get('/:id', courseController.getById);

/**
 * POST /api/courses
 */
router.post(
  '/',
  [
    body('course_id')
      .trim()
      .notEmpty()
      .withMessage('Mã môn học là bắt buộc')
      .isLength({ max: 10 }),
    body('course_name')
      .trim()
      .notEmpty()
      .withMessage('Tên môn học là bắt buộc')
      .isLength({ max: 200 }),
    body('credits')
      .isInt({ min: 1, max: 10 })
      .withMessage('Số tín chỉ phải từ 1 đến 10'),
    body('department').optional().trim(),
    body('description').optional().trim(),
    body('prerequisite_id').optional().trim(),
    body('is_active').optional().isBoolean(),
    validate,
  ],
  courseController.create
);

/**
 * PUT /api/courses/:id
 */
router.put('/:id', courseController.update);

module.exports = router;
