const prisma = require('../config/db');

// Create a Quiz for a lesson
const createQuiz = async (req, res) => {
    try {
        const { title, lessonId } = req.body;
        // Check if lesson belongs to instructor's course... (simplified for now)

        const quiz = await prisma.quiz.create({
            data: { title, lessonId }
        });
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add Question to Quiz
const addQuestion = async (req, res) => {
    try {
        const { quizId, text, choices } = req.body; // choices: [{text, isCorrect}]

        const question = await prisma.question.create({
            data: {
                text,
                quizId,
                choices: {
                    create: choices
                }
            },
            include: { choices: true }
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Quiz details (for taking the quiz)
const getQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    include: {
                        choices: {
                            select: { id: true, text: true } // Hide isCorrect
                        }
                    }
                }
            }
        });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit Quiz
const submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body; // answers: { questionId: choiceId }
        const userId = req.user.id;

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: { choices: true }
                }
            }
        });

        let score = 0;
        let total = quiz.questions.length;

        quiz.questions.forEach(q => {
            const userChoiceId = answers[q.id];
            const correctChoice = q.choices.find(c => c.isCorrect);
            if (correctChoice && correctChoice.id === userChoiceId) {
                score++;
            }
        });

        const passed = (score / total) >= 0.7; // 70% pass rate

        const attempt = await prisma.quizAttempt.create({
            data: {
                userId,
                quizId,
                score,
                passed
            }
        });

        res.json({ score, total, passed, attempt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createQuiz, addQuestion, getQuiz, submitQuiz };
