const { body } = require('express-validator');

const courseSchema = [
  body('course_id')
    .trim()
    .notEmpty()
    .withMessage('Mã môn học là bắt buộc')
    .isLength({ max: 10 })
    .withMessage('Mã môn học tối đa 10 ký tự'),
  body('course_name')
    .trim()
    .notEmpty()
    .withMessage('Tên môn học là bắt buộc')
    .isLength({ max: 200 })
    .withMessage('Tên môn học tối đa 200 ký tự'),
  body('credits')
    .isInt({ min: 1, max: 10 })
    .withMessage('Số tín chỉ phải từ 1 đến 10'),
  body('department').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim(),
  body('prerequisite_id').optional().trim().isLength({ max: 10 }),
  body('is_active').optional().isBoolean(),
];

const updateCourseSchema = [
  body('course_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tên môn học không được để trống')
    .isLength({ max: 200 }),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Số tín chỉ phải từ 1 đến 10'),
  body('department').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim(),
  body('prerequisite_id').optional().trim().isLength({ max: 10 }),
  body('is_active').optional().isBoolean(),
];

module.exports = { courseSchema, updateCourseSchema };
