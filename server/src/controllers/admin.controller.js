const { Course, Semester, Section, Schedule, Enrollment, Student, Result } = require('../models');
const ApiError = require('../utils/ApiError');
const { Sequelize } = require('sequelize');

class AdminController {
  // --- Course Management ---
  async getAllCourses(req, res, next) {
    try {
      const courses = await Course.findAll({
        include: [{ model: Course, as: 'prerequisite', attributes: ['course_id', 'course_name'] }],
        order: [['course_id', 'ASC']],
      });
      res.status(200).json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req, res, next) {
    try {
      const course = await Course.create(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const [updated] = await Course.update(req.body, { where: { course_id: id } });
      if (!updated) throw ApiError.notFound('Course not found');
      const course = await Course.findByPk(id);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Course.destroy({ where: { course_id: id } });
      if (!deleted) throw ApiError.notFound('Course not found');
      res.status(200).json({ success: true, message: 'Course deleted' });
    } catch (error) {
      next(error);
    }
  }

  // --- Semester Management ---
  async getAllSemesters(req, res, next) {
    try {
      const semesters = await Semester.findAll({ order: [['start_date', 'DESC']] });
      res.status(200).json({ success: true, data: semesters });
    } catch (error) {
      next(error);
    }
  }

  async createSemester(req, res, next) {
    try {
      if (req.body.is_current) {
        await Semester.update({ is_current: false }, { where: {} });
      }
      const semester = await Semester.create(req.body);
      res.status(201).json({ success: true, data: semester });
    } catch (error) {
      next(error);
    }
  }

  async updateSemester(req, res, next) {
    try {
      const { id } = req.params;
      if (req.body.is_current) {
        await Semester.update({ is_current: false }, { where: { semester_id: { [Sequelize.Op.ne]: id } } });
      }
      const [updated] = await Semester.update(req.body, { where: { semester_id: id } });
      if (!updated) throw ApiError.notFound('Semester not found');
      const semester = await Semester.findByPk(id);
      res.status(200).json({ success: true, data: semester });
    } catch (error) {
      next(error);
    }
  }

  // --- Section Management ---
  async getAllSections(req, res, next) {
    try {
      const { semester_id } = req.query;
      const where = semester_id ? { semester_id } : {};
      const sections = await Section.findAll({
        where,
        include: [
          { model: Course, as: 'course' },
          { model: Semester, as: 'semester' },
          { model: Schedule, as: 'schedules' },
        ],
        order: [['section_code', 'ASC']],
      });
      res.status(200).json({ success: true, data: sections });
    } catch (error) {
      next(error);
    }
  }

  async createSection(req, res, next) {
    try {
      const section = await Section.create(req.body);
      res.status(201).json({ success: true, data: section });
    } catch (error) {
      next(error);
    }
  }

  // --- Enrollment Monitoring ---
  async getEnrollmentRequests(req, res, next) {
    try {
      const enrollments = await Enrollment.findAll({
        include: [
          { model: Student, as: 'student', attributes: ['student_id', 'full_name'] },
          { 
            model: Section, 
            as: 'section', 
            include: [{ model: Course, as: 'course', attributes: ['course_name', 'course_id'] }] 
          },
        ],
        order: [['enrolled_at', 'DESC']],
      });
      res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
      next(error);
    }
  }

  async updateEnrollmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const [updated] = await Enrollment.update({ status }, { where: { enrollment_id: id } });
      if (!updated) throw ApiError.notFound('Enrollment not found');
      res.status(200).json({ success: true, message: 'Status updated' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
