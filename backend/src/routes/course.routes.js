const express = require('express');
const { createCourse, getCourses, getCourseById, getInstructorCourses } = require('../controllers/course.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', getCourses);
router.get('/my-courses', authenticateToken, authorizeRoles('INSTRUCTOR', 'ADMIN'), getInstructorCourses);
router.get('/:id', getCourseById);

router.post(
    '/',
    authenticateToken,
    authorizeRoles('INSTRUCTOR', 'ADMIN'),
    upload.single('thumbnail'),
    createCourse
);

module.exports = router;
