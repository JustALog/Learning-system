const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const sectionController = require('../controllers/section.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// GET /api/sections
router.get('/', sectionController.getAll);

// GET /api/sections/:id
router.get('/:id', sectionController.getById);

// POST /api/sections
router.post(
  '/',
  [
    body('section_code')
      .trim()
      .notEmpty()
      .withMessage('Mã lớp học phần là bắt buộc'),
    body('course_id')
      .trim()
      .notEmpty()
      .withMessage('Mã môn học là bắt buộc'),
    body('semester_id')
      .isInt()
      .withMessage('ID học kỳ là bắt buộc'),
    body('max_students')
      .isInt({ min: 1 })
      .withMessage('Sĩ số tối đa phải >= 1'),
    body('lecturer_name').optional().trim(),
    body('room').optional().trim(),
    body('schedules').optional().isArray(),
    body('schedules//.day_of_week')
      .optional()
      .isInt({ min: 2, max: 8 })
      .withMessage('day_of_week phải từ 2-8'),
    body('schedules//.start_period')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('start_period phải từ 1-12'),
    body('schedules//.end_period')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('end_period phải từ 1-12'),
    validate,
  ],
  sectionController.create
);

// PUT /api/sections/:id
router.put('/:id', sectionController.update);

module.exports = router;
