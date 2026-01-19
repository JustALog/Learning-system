const express = require('express');
const { enrollCourse, updateLessonProgress, getMyEnrollments } = require('../controllers/progress.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken); // Protect all routes

router.post('/enroll', enrollCourse);
router.post('/lesson', updateLessonProgress);
router.get('/my', getMyEnrollments);

module.exports = router;
