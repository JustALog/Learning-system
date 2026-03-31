const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { Student, Admin } = require('../models');

/**
 * JWT Authentication middleware
 * Verifies the Bearer token and attaches user info to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not configured');
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Yêu cầu token xác thực');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findByPk(decoded.userId, {
        attributes: { exclude: ['password_hash'] },
      });
    } else {
      user = await Student.findByPk(decoded.userId, {
        attributes: { exclude: ['password_hash'] },
      });
    }

    if (!user) {
      throw ApiError.unauthorized('Người dùng không tồn tại');
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      throw ApiError.forbidden('Tài khoản đã bị khóa hoặc vô hiệu hóa');
    }

    req.user = user;
    req.role = decoded.role;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(ApiError.unauthorized('Token không hợp lệ hoặc đã hết hạn'));
  }
};

const authorizeSelf = (req, res, next) => {
  const { id } = req.params;

  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.role === 'admin') {
    return next(); // Admin can access everything
  }

  // If the parameter 'id' exists, it must match the logged-in student's id
  if (id && id !== req.user.student_id) {
    return next(ApiError.forbidden('You do not have permission to access this resource'));
  }

  next();
};

const authorizeAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return next(ApiError.forbidden('Chỉ quản trị viên mới có quyền thực hiện thao tác này'));
  }
  next();
};

const authorizeStudent = (req, res, next) => {
  if (req.role !== 'student') {
    return next(ApiError.forbidden('Chỉ sinh viên mới có quyền thực hiện thao tác này'));
  }
  next();
};

module.exports = { authenticate, authorizeSelf, authorizeAdmin, authorizeStudent };
