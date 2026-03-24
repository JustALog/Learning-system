const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticate);
router.use(authorizeAdmin);

// --- Course Management ---
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// --- Semester Management ---
router.get('/semesters', adminController.getAllSemesters);
router.post('/semesters', adminController.createSemester);
router.put('/semesters/:id', adminController.updateSemester);

// --- Section Management ---
router.get('/sections', adminController.getAllSections);
router.post('/sections', adminController.createSection);

// --- Enrollment Monitoring ---
router.get('/enrollments/requests', adminController.getEnrollmentRequests);
router.put('/enrollments/:id/status', adminController.updateEnrollmentStatus);

module.exports = router;
