const { Semester } = require('../models');
const ApiError = require('../utils/ApiError');

class SemesterController {
  /**
   * GET /api/semesters
   */
  async getAll(req, res, next) {
    try {
      const semesters = await Semester.findAll({
        order: [['semester_id', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: { semesters },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/semesters/current
   */
  async getCurrent(req, res, next) {
    try {
      const semester = await Semester.findOne({
        where: { is_current: true },
      });

      if (!semester) {
        throw ApiError.notFound('Không tìm thấy học kỳ hiện tại');
      }

      res.status(200).json({
        success: true,
        data: { semester },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/semesters/:id
   */
  async getById(req, res, next) {
    try {
      const semester = await Semester.findByPk(req.params.id);
      if (!semester) {
        throw ApiError.notFound('Học kỳ không tồn tại');
      }

      res.status(200).json({
        success: true,
        data: { semester },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/semesters
   */
  async create(req, res, next) {
    try {
      const semester = await Semester.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo học kỳ thành công',
        data: { semester },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/semesters/:id
   */
  async update(req, res, next) {
    try {
      const semester = await Semester.findByPk(req.params.id);
      if (!semester) {
        throw ApiError.notFound('Học kỳ không tồn tại');
      }

      // If setting is_current to true, unset all others first
      if (req.body.is_current === true) {
        await Semester.update(
          { is_current: false },
          { where: { is_current: true } }
        );
      }

      await semester.update(req.body);

      res.status(200).json({
        success: true,
        message: 'Cập nhật học kỳ thành công',
        data: { semester },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SemesterController();
