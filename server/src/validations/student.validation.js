const { body } = require('express-validator');

const updateStudentSchema = [
  body('full_name')
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Họ và tên tối đa 100 ký tự'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('date_of_birth')
    .optional()
    .isDate()
    .withMessage('Ngày sinh không hợp lệ'),
  body('major')
    .optional()
    .trim()
    .isLength({ max: 100 }),
];

module.exports = { updateStudentSchema };
