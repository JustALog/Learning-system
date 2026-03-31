const express = require('express');
const semesterController = require('../controllers/semester.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const { semesterSchema, updateSemesterSchema } = require('../validations/semester.validation');

const router = express.Router();

router.use(authenticate);

/// GET /api/semesters
router.get('/', semesterController.getAll);

/// GET /api/semesters/current
router.get('/current', semesterController.getCurrent);

/// GET /api/semesters/:id
router.get('/:id', semesterController.getById);

/// POST /api/semesters
router.post('/', semesterSchema, validate, semesterController.create);

/// PUT /api/semesters/:id
router.put('/:id', updateSemesterSchema, validate, semesterController.update);

module.exports = router;
