const { Course } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

class CourseController {
  /**
   * GET /api/courses
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, department, is_active, search } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (department) where.department = department;
      if (is_active !== undefined) where.is_active = is_active === 'true';
      if (search) {
        where[Op.or] = [
          { course_id: { [Op.like]: `%${search}%` } },
          { course_name: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Course.findAndCountAll({
        where,
        include: [
          {
            model: Course,
            as: 'prerequisite',
            attributes: ['course_id', 'course_name'],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['course_id', 'ASC']],
      });

      res.status(200).json({
        success: true,
        data: {
          courses: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courses/:id
   */
  async getById(req, res, next) {
    try {
      const course = await Course.findByPk(req.params.id, {
        include: [
          {
            model: Course,
            as: 'prerequisite',
            attributes: ['course_id', 'course_name'],
          },
        ],
      });

      if (!course) {
        throw ApiError.notFound('Môn học không tồn tại');
      }

      res.status(200).json({
        success: true,
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/courses
   */
  async create(req, res, next) {
    try {
      const course = await Course.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo môn học thành công',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/courses/:id
   */
  async update(req, res, next) {
    try {
      const course = await Course.findByPk(req.params.id);
      if (!course) {
        throw ApiError.notFound('Môn học không tồn tại');
      }

      await course.update(req.body);

      res.status(200).json({
        success: true,
        message: 'Cập nhật môn học thành công',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseController();
