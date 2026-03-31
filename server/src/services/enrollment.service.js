const { sequelize, Enrollment, Section, Semester, Student, Schedule } = require('../models');
const ApiError = require('../utils/ApiError');
const scheduleService = require('./schedule.service');

class EnrollmentService {
  /**
   * Enroll a student in a section.
   * Implements BR01 - BR06.
   *
   * @param {string} studentId
   * @param {number} sectionId
   * @returns {Object} The created enrollment record
   */
  async enroll(studentId, sectionId) {
    // Use a transaction for atomicity (critical for current_students counter)
    const transaction = await sequelize.transaction();

    try {
      // ── BR05: Check student status ──
      const student = await Student.findByPk(studentId, { transaction });
      if (!student) {
        throw ApiError.notFound('Sinh viên không tồn tại');
      }
      if (student.status === 'suspended') {
        throw ApiError.forbidden('Tài khoản bị khóa, không thể đăng ký học phần');
      }

      // ── Load section with semester ──
      const section = await Section.findByPk(sectionId, {
        include: [{ model: Semester, as: 'semester' }],
        lock: transaction.LOCK.UPDATE, // Row-level lock for race condition prevention
        transaction,
      });

      if (!section) {
        throw ApiError.notFound('Lớp học phần không tồn tại');
      }

      // ── BR06: Check section status ──
      if (section.status !== 'open') {
        throw ApiError.badRequest(`Lớp học phần đã ${section.status === 'closed' ? 'đóng' : 'bị hủy'}`);
      }

      // ── BR03: Check registration period ──
      const now = new Date();
      const semester = section.semester;
      if (now < new Date(semester.reg_open) || now > new Date(semester.reg_close)) {
        throw ApiError.badRequest(
          `Ngoài thời gian đăng ký. Đăng ký mở từ ${semester.reg_open} đến ${semester.reg_close}`
        );
      }

      // ── BR02: Check capacity ──
      if (section.current_students >= section.max_students) {
        throw ApiError.badRequest('Lớp học phần đã đủ sĩ số');
      }

      // ── BR01: Check duplicate enrollment ──
      const existingEnrollment = await Enrollment.findOne({
        where: {
          student_id: studentId,
          section_id: sectionId,
        },
        transaction,
      });

      if (existingEnrollment) {
        if (existingEnrollment.status === 'enrolled') {
          throw ApiError.conflict('Bạn đã đăng ký lớp học phần này rồi');
        }
        if (existingEnrollment.status === 'completed') {
          throw ApiError.conflict('Bạn đã hoàn thành lớp học phần này');
        }
        // If status is 'cancelled', allow re-enrollment by updating the record
        existingEnrollment.status = 'enrolled';
        existingEnrollment.enrolled_at = new Date();
        existingEnrollment.cancelled_at = null;
        existingEnrollment.cancel_reason = null;
        await existingEnrollment.save({ transaction });

        // Increment current_students atomically
        await Section.increment('current_students', {
          by: 1,
          where: { section_id: sectionId },
          transaction,
        });

        await transaction.commit();

        return existingEnrollment.reload({
          include: [{ model: Section, as: 'section' }],
        });
      }

      // ── BR04: Check schedule conflict ──
      const conflicts = await scheduleService.checkConflicts(
        studentId,
        sectionId,
        section.semester_id
      );

      if (conflicts.length > 0) {
        throw ApiError.conflict('Trùng lịch học với lớp học phần đã đăng ký', conflicts);
      }

      // ── Create enrollment ──
      const enrollment = await Enrollment.create(
        {
          student_id: studentId,
          section_id: sectionId,
          enrolled_at: new Date(),
          status: 'enrolled',
        },
        { transaction }
      );

      // ── Increment current_students atomically ──
      await Section.increment('current_students', {
        by: 1,
        where: { section_id: sectionId },
        transaction,
      });

      await transaction.commit();

      return enrollment.reload({
        include: [{ model: Section, as: 'section' }],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cancel an enrollment.
   * Implements BR07 - BR09.
   *
   * @param {string} studentId
   * @param {number} enrollmentId
   * @param {string} cancelReason
   * @returns {Object} The updated enrollment record
   */
  async cancel(studentId, enrollmentId, cancelReason = '') {
    const transaction = await sequelize.transaction();

    try {
      const enrollment = await Enrollment.findOne({
        where: {
          enrollment_id: enrollmentId,
          student_id: studentId,
        },
        include: [
          {
            model: Section,
            as: 'section',
            include: [{ model: Semester, as: 'semester' }],
          },
        ],
        transaction,
      });

      if (!enrollment) {
        throw ApiError.notFound('Bản ghi đăng ký không tồn tại');
      }

      if (enrollment.status !== 'enrolled') {
        throw ApiError.badRequest(
          `Không thể hủy - trạng thái hiện tại: ${enrollment.status}`
        );
      }

      // ── BR07: Check registration period for cancellation ──
      const now = new Date();
      const semester = enrollment.section.semester;
      if (now < new Date(semester.reg_open) || now > new Date(semester.reg_close)) {
        throw ApiError.badRequest(
          `Ngoài thời gian hủy đăng ký. Cho phép từ ${semester.reg_open} đến ${semester.reg_close}`
        );
      }

      // ── BR09: Soft delete - update status, do NOT delete record ──
      enrollment.status = 'cancelled';
      enrollment.cancelled_at = new Date();
      enrollment.cancel_reason = cancelReason || null;
      await enrollment.save({ transaction });

      // ── BR08: Decrement current_students atomically ──
      await Section.decrement('current_students', {
        by: 1,
        where: { section_id: enrollment.section_id },
        transaction,
      });

      await transaction.commit();

      return enrollment.reload({
        include: [
          {
            model: Section,
            as: 'section',
            include: [{ model: Semester, as: 'semester' }],
          },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get all enrollments for a student, optionally filtered by semester.
   */
  async getStudentEnrollments(studentId, semesterId = null) {
    const where = {
      student_id: studentId,
    };

    const sectionWhere = {};
    if (semesterId) {
      sectionWhere.semester_id = semesterId;
    }

    const enrollments = await Enrollment.findAll({
      where,
      include: [
        {
          model: Section,
          as: 'section',
          where: Object.keys(sectionWhere).length > 0 ? sectionWhere : undefined,
          include: [
            { model: Semester, as: 'semester' },
            { model: Schedule, as: 'schedules' },
            {
              model: require('../models').Course,
              as: 'course',
            },
          ],
        },
      ],
      order: [['enrolled_at', 'DESC']],
    });

    return enrollments;
  }
}

module.exports = new EnrollmentService();
