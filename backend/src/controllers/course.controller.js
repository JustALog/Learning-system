const prisma = require('../config/db');

// Create a new course
const createCourse = async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const instructorId = req.user.id;

        // Handle thumbnail upload if present
        let thumbnailUrl = null;
        if (req.file) {
            thumbnailUrl = req.file.path;
        }

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price: parseFloat(price || 0),
                instructorId,
                thumbnailUrl
            }
        });

        res.status(201).json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all published courses
const getCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: { published: true },
            include: { instructor: { select: { fullName: true } } }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single course details
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                instructor: { select: { fullName: true, bio: true, avatarUrl: true } },
                modules: {
                    include: {
                        lessons: {
                            select: { id: true, title: true, type: true, order: true } // Hide content/videoUrl for non-enrolled?
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Instructor Courses
const getInstructorCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: { instructorId: req.user.id }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createCourse, getCourses, getCourseById, getInstructorCourses };
