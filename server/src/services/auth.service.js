const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Student, Admin } = require('../models');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;

class AuthService {
  /**
   * Register a new student account
   */
  async register({ student_id, full_name, email, password, date_of_birth, major, academic_year }) {
    // Check if student_id already exists
    const existingById = await Student.findByPk(student_id);
    if (existingById) {
      throw ApiError.conflict('Mã sinh viên đã tồn tại');
    }

    // Check if email already exists
    const existingByEmail = await Student.findOne({ where: { email } });
    if (existingByEmail) {
      throw ApiError.conflict('Email đã được sử dụng');
    }

    // Hash password with bcrypt (salt rounds = 10)
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const student = await Student.create({
      student_id,
      full_name,
      email,
      password_hash,
      date_of_birth: date_of_birth || null,
      major: major || null,
      academic_year: academic_year || null,
      status: 'active',
    });

    // Return student without password_hash
    const studentData = student.toJSON();
    delete studentData.password_hash;

    return {
      user: studentData,
      role: 'student',
      token: this._generateToken(student, 'student'),
    };
  }

  /**
   * Login with identifier and password based on role
   */
  async login(identifier, password, role = 'student') {
    if (role === 'admin') {
      const admin = await Admin.findByPk(identifier);
      if (!admin) {
        throw ApiError.unauthorized('Mã quản trị viên hoặc mật khẩu không đúng');
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Mã quản trị viên hoặc mật khẩu không đúng');
      }

      if (admin.status === 'inactive') {
        throw ApiError.forbidden('Tài khoản quản trị đã bị vô hiệu hóa');
      }

      const adminData = admin.toJSON();
      delete adminData.password_hash;

      return {
        user: adminData,
        role: 'admin',
        token: this._generateToken(admin, 'admin'),
      };
    }

    // Default: Student login
    const student = await Student.findByPk(identifier);
    if (!student) {
      throw ApiError.unauthorized('Mã sinh viên hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, student.password_hash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Mã sinh viên hoặc mật khẩu không đúng');
    }

    if (student.status === 'suspended') {
      throw ApiError.forbidden('Tài khoản đã bị khóa');
    }

    const studentData = student.toJSON();
    delete studentData.password_hash;

    return {
      user: studentData,
      role: 'student',
      token: this._generateToken(student, 'student'),
    };
  }

  /**
   * Generate JWT token
   */
  _generateToken(user, role) {
    const payload = {
      userId: role === 'admin' ? user.admin_id : user.student_id,
      email: user.email,
      role: role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
  }
}

module.exports = new AuthService();
