const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { Student } = require('../models');

/**
 * JWT Authentication middleware
 * Verifies the Bearer token and attaches user info to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await Student.findByPk(decoded.studentId, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!student) {
      throw ApiError.unauthorized('Student not found');
    }

    if (student.status === 'suspended') {
      throw ApiError.forbidden('Account is suspended');
    }

    req.user = student;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

const authorizeSelf = (req, res, next) => {
  const { id } = req.params;

  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  // If the parameter 'id' exists, it must match the logged-in student's id
  if (id && id !== req.user.student_id) {
    return next(ApiError.forbidden('You do not have permission to access this resource'));
  }

  next();
};

module.exports = { authenticate, authorizeSelf };
