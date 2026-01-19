const prisma = require('../config/db');

// Enroll in a Course
const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        const existingRef = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId }
            }
        });

        if (existingRef) return res.status(400).json({ message: 'Already enrolled' });

        const enrollment = await prisma.enrollment.create({
            data: { userId, courseId }
        });

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Lesson Progress
const updateLessonProgress = async (req, res) => {
    try {
        const { lessonId, isCompleted } = req.body;
        const userId = req.user.id;

        const progress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: { userId, lessonId }
            },
            update: { isCompleted },
            create: { userId, lessonId, isCompleted }
        });

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get My Enrollments
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user.id },
            include: { course: true }
        });
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { enrollCourse, updateLessonProgress, getMyEnrollments };
