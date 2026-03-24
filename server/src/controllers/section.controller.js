const { Section, Course, Semester, Schedule } = require('../models');
const ApiError = require('../utils/ApiError');

class SectionController {
  /**
   * GET /api/sections
   */
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        semester_id,
        course_id,
        status,
      } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (semester_id) where.semester_id = semester_id;
      if (course_id) where.course_id = course_id;
      if (status) where.status = status;

      const { count, rows } = await Section.findAndCountAll({
        where,
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['course_id', 'course_name', 'credits'],
          },
          {
            model: Semester,
            as: 'semester',
            attributes: ['semester_id', 'semester_name'],
          },
          {
            model: Schedule,
            as: 'schedules',
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['section_id', 'ASC']],
        distinct: true, // Fix count when using include
      });

      res.status(200).json({
        success: true,
        data: {
          sections: rows,
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
   * GET /api/sections/:id
   */
  async getById(req, res, next) {
    try {
      const section = await Section.findByPk(req.params.id, {
        include: [
          { model: Course, as: 'course' },
          { model: Semester, as: 'semester' },
          { model: Schedule, as: 'schedules' },
        ],
      });

      if (!section) {
        throw ApiError.notFound('Lớp học phần không tồn tại');
      }

      res.status(200).json({
        success: true,
        data: { section },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/sections
   */
  async create(req, res, next) {
    try {
      const { schedules, ...sectionData } = req.body;

      const section = await Section.create(sectionData);

      // Create schedules if provided
      if (schedules && schedules.length > 0) {
        const scheduleRecords = schedules.map((s) => ({
          ...s,
          section_id: section.section_id,
        }));
        await Schedule.bulkCreate(scheduleRecords);
      }

      // Reload with associations
      const result = await Section.findByPk(section.section_id, {
        include: [
          { model: Course, as: 'course' },
          { model: Semester, as: 'semester' },
          { model: Schedule, as: 'schedules' },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Tạo lớp học phần thành công',
        data: { section: result },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/sections/:id
   */
  async update(req, res, next) {
    try {
      const section = await Section.findByPk(req.params.id);
      if (!section) {
        throw ApiError.notFound('Lớp học phần không tồn tại');
      }

      const { schedules, ...sectionData } = req.body;
      await section.update(sectionData);

      // Optionally replace schedules
      if (schedules) {
        await Schedule.destroy({ where: { section_id: section.section_id } });
        if (schedules.length > 0) {
          const scheduleRecords = schedules.map((s) => ({
            ...s,
            section_id: section.section_id,
          }));
          await Schedule.bulkCreate(scheduleRecords);
        }
      }

      const result = await Section.findByPk(section.section_id, {
        include: [
          { model: Course, as: 'course' },
          { model: Semester, as: 'semester' },
          { model: Schedule, as: 'schedules' },
        ],
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật lớp học phần thành công',
        data: { section: result },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SectionController();
