const { Student } = require('../models');
const ApiError = require('../utils/ApiError');

class StudentController {
  // GET /api/students
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, status, major } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (major) where.major = major;

      const { count, rows } = await Student.findAndCountAll({
        where,
        attributes: { exclude: ['password_hash'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: {
          students: rows,
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

  
  // GET /api/students/me
  async getMe(req, res, next) {
    try {
      // req.user is already populated by authenticate middleware
      res.status(200).json({
        success: true,
        data: { student: req.user },
      });
    } catch (error) {
      next(error);
    }
  }

  
  // GET /api/students/:id
  async getById(req, res, next) {
    try {
      const student = await Student.findByPk(req.params.id, {
        attributes: { exclude: ['password_hash'] },
      });

      if (!student) {
        throw ApiError.notFound('Sinh viên không tồn tại');
      }

      res.status(200).json({
        success: true,
        data: { student },
      });
    } catch (error) {
      next(error);
    }
  }

  
  // PUT /api/students/:id
  async update(req, res, next) {
    try {
      const student = await Student.findByPk(req.params.id);
      if (!student) {
        throw ApiError.notFound('Sinh viên không tồn tại');
      }

      const { full_name, date_of_birth, major, academic_year, status } = req.body;

      await student.update({
        ...(full_name && { full_name }),
        ...(date_of_birth !== undefined && { date_of_birth }),
        ...(major !== undefined && { major }),
        ...(academic_year !== undefined && { academic_year }),
        ...(status && { status }),
      });

      const updatedStudent = student.toJSON();
      delete updatedStudent.password_hash;

      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin sinh viên thành công',
        data: { student: updatedStudent },
      });
    } catch (error) {
      next(error);
    }
  }

  
  // GET /api/students/:id/stats
  async getStats(req, res, next) {
    try {
      const studentId = req.params.id;
      const { Enrollment, Section, Course, Semester } = require('../models');

      // Get current semester
      const currentSemester = await Semester.findOne({ where: { is_current: true } });
      
      // Get all enrollments
      const enrollments = await Enrollment.findAll({
        where: { student_id: studentId },
        include: [{
          model: Section,
          as: 'section',
          include: [{ model: Course, as: 'course' }]
        }]
      });

      // Default for demo - in production this would be calculated from real data
      let accumulatedCredits = 85; 
      let totalGpa = 3.2; 
      let registeredCourses = 0;
      let semesterCredits = 0;

      if (currentSemester) {
        const currentEnrollments = enrollments.filter(e => 
          e.section.semester_id === currentSemester.semester_id && e.status === 'enrolled'
        );
        registeredCourses = currentEnrollments.length;
        semesterCredits = currentEnrollments.reduce((sum, e) => sum + e.section.course.credits, 0);
      }

      res.status(200).json({
        success: true,
        data: {
          accumulatedCredits,
          totalCreditsRequired: 120,
          gpa: totalGpa,
          maxGpa: 4.0,
          registeredCourses,
          maxCourses: 8,
          semesterCredits,
          maxSemesterCredits: 21,
          semesterName: currentSemester ? currentSemester.semester_name : '',
          academicYear: currentSemester ? currentSemester.academic_year : ''
        }
      });
    } catch (error) {
      next(error);
    }
  }

  
  // GET /api/students/:id/schedule
  async getSchedule(req, res, next) {
    try {
      const studentId = req.params.id;
      const { semester_id } = req.query;
      const { Enrollment, Section, Course, Semester, Schedule } = require('../models');

      const currentSemester = semester_id 
        ? await Semester.findByPk(semester_id)
        : await Semester.findOne({ where: { is_current: true } });

      if (!currentSemester) {
        return res.status(200).json({ success: true, data: { schedule: [] } });
      }

      const enrollments = await Enrollment.findAll({
        where: { 
          student_id: studentId,
          status: 'enrolled'
        },
        include: [
          {
            model: Section,
            as: 'section',
            where: { semester_id: currentSemester.semester_id },
            include: [
              { model: Course, as: 'course' },
              { model: Schedule, as: 'schedules' }
            ]
          }
        ]
      });

      // Format schedule for the weekly grid
      const schedule = [];
      enrollments.forEach(enrollment => {
        if (enrollment.section.schedules) {
          enrollment.section.schedules.forEach(s => {
            schedule.push({
              course_id: enrollment.section.course_id,
              course_name: enrollment.section.course.course_name,
              day_of_week: s.day_of_week,
              start_period: s.start_period,
              end_period: s.end_period,
              room: s.room || enrollment.section.room,
              lecturer: enrollment.section.lecturer_name
            });
          });
        }
      });

      res.status(200).json({
        success: true,
        data: { schedule }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
