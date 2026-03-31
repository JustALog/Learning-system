const express = require('express');
const { courseSchema, updateCourseSchema } = require('../validations/course.validation');
const { validate } = require('../middleware/validate');
const courseController = require('../controllers/course.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// All course routes require authentication
router.use(authenticate);

//GET /api/courses
router.get('/', courseController.getAll);

//GET /api/courses/:id
router.get('/:id', courseController.getById);

// POST /api/courses (admin only)
router.post('/', authorizeAdmin, courseSchema, validate, courseController.create);

// PUT /api/courses/:id (admin only)
router.put('/:id', authorizeAdmin, updateCourseSchema, validate, courseController.update);

module.exports = router;
