const express = require('express');
const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const courseRoutes = require('./course.routes');
const semesterRoutes = require('./semester.routes');
const sectionRoutes = require('./section.routes');
const enrollmentRoutes = require('./enrollment.routes');
const resultRoutes = require('./result.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/semesters', semesterRoutes);
router.use('/sections', sectionRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/results', resultRoutes);

module.exports = router;
