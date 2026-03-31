const authService = require('../services/auth.service');

class AuthController {
  // POST /api/auth/register
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

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { identifier, password, role } = req.body;
      const result = await authService.login(identifier, password, role);
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  async getProfile(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: { 
          ...req.user?.toJSON?.() || req.user,
          role: req.role 
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
