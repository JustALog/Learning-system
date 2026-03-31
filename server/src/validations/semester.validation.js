const { body } = require('express-validator');

const semesterSchema = [
  body('semester_name')
    .trim()
    .notEmpty()
    .withMessage('Tên học kỳ là bắt buộc')
    .isLength({ max: 100 }),
  body('semester_id')
    .trim()
    .notEmpty()
    .withMessage('Mã học kỳ là bắt buộc')
    .isLength({ max: 20 }),
  body('semester_number')
    .isInt({ min: 1, max: 3 })
    .withMessage('Số học kỳ phải từ 1 đến 3'),
  body('academic_year')
    .trim()
    .notEmpty()
    .withMessage('Năm học là bắt buộc')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Năm học phải theo định kỳ YYYY-YYYY (Vd: 2026-2027)'),
  body('start_date')
    .notEmpty()
    .withMessage('Ngày bắt đầu là bắt buộc')
    .isISO8601()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('end_date')
    .notEmpty()
    .withMessage('Ngày kết thúc là bắt buộc')
    .isISO8601()
    .withMessage('Ngày kết thúc không hợp lệ'),
  body('reg_open')
    .optional()
    .isISO8601()
    .withMessage('Ngày mở đăng ký không hợp lệ'),
  body('reg_close')
    .optional()
    .isISO8601()
    .withMessage('Ngày đóng đăng ký không hợp lệ'),
];

const updateSemesterSchema = [
  body('semester_name')
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 100 }),
  body('start_date')
    .optional()
    .isISO8601(),
  body('end_date')
    .optional()
    .isISO8601(),
  body('reg_open')
    .optional()
    .isISO8601(),
  body('reg_close')
    .optional()
    .isISO8601(),
  body('is_current')
    .optional()
    .isBoolean()
];

module.exports = { semesterSchema, updateSemesterSchema };
