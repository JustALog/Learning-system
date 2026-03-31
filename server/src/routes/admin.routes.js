const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const { courseSchema, updateCourseSchema } = require('../validations/course.validation');
const { semesterSchema, updateSemesterSchema } = require('../validations/semester.validation');
const { sectionSchema } = require('../validations/section.validation');
const { body } = require('express-validator');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticate);
router.use(authorizeAdmin);

// --- Course Management ---
router.get('/courses', adminController.getAllCourses);
router.post('/courses', courseSchema, validate, adminController.createCourse);
router.put('/courses/:id', updateCourseSchema, validate, adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// --- Semester Management ---
router.get('/semesters', adminController.getAllSemesters);
router.post('/semesters', semesterSchema, validate, adminController.createSemester);
router.put('/semesters/:id', updateSemesterSchema, validate, adminController.updateSemester);
router.delete('/semesters/:id', adminController.deleteSemester);

// --- Section Management ---
router.get('/sections', adminController.getAllSections);
router.post('/sections', sectionSchema, validate, adminController.createSection);

// --- Enrollment Monitoring ---
router.get('/enrollments/requests', adminController.getEnrollmentRequests);
router.put(
  '/enrollments/:id/status',
  [
    body('status')
      .isIn(['enrolled', 'cancelled', 'completed'])
      .withMessage('Trạng thái không hợp lệ'),
    validate,
  ],
  adminController.updateEnrollmentStatus
);

module.exports = router;
