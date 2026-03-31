const { body } = require('express-validator');

const sectionSchema = [
  body('section_code')
    .trim()
    .notEmpty()
    .withMessage('Mã lớp học phần là bắt buộc')
    .isLength({ max: 20 }),
  body('course_id')
    .trim()
    .notEmpty()
    .withMessage('Mã môn học là bắt buộc')
    .isLength({ max: 10 }),
  body('semester_id')
    .trim()
    .notEmpty()
    .withMessage('Mã học kỳ là bắt buộc')
    .isInt()
    .withMessage('Mã học kỳ phải là số'),
  body('max_students')
    .isInt({ min: 1 })
    .withMessage('Sĩ số tối đa phải ít nhất là 1'),
  body('lecturer_name')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('room')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('status')
    .optional()
    .isIn(['open', 'closed', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  body('schedules').optional().isArray(),
  body('schedules.*.day_of_week')
    .optional()
    .isInt({ min: 2, max: 8 }) // 2: Thứ 2, ..., 8: Chủ nhật
    .withMessage('Ngày trong tuần không hợp lệ (2-8)'),
  body('schedules.*.start_period')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Tiết bắt đầu không hợp lệ (1-12)'),
  body('schedules.*.end_period')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Tiết kết thúc không hợp lệ (1-12)'),
];

const updateSectionSchema = [
  body('max_students')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sĩ số tối đa phải ít nhất là 1'),
  body('lecturer_name')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('room')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('status')
    .optional()
    .isIn(['open', 'closed', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  body('schedules').optional().isArray(),
];

module.exports = { sectionSchema, updateSectionSchema };
