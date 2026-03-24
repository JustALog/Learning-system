const authService = require('../services/auth.service');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { student_id, password } = req.body;
      const result = await authService.login(student_id, password);
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getProfile(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: { student: req.user },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
