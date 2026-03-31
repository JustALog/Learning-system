const enrollmentService = require('../services/enrollment.service');

class EnrollmentController {
  /**
   * POST /api/enrollments
   * Body: { section_id }
   */
  async enroll(req, res, next) {
    try {
      const studentId = req.user.student_id;
      const { section_id } = req.body;

      const enrollment = await enrollmentService.enroll(studentId, section_id);

      res.status(201).json({
        success: true,
        message: 'Đăng ký học phần thành công',
        data: { enrollment },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/enrollments/:id/cancel
   * Body: { cancel_reason? }
   */
  async cancel(req, res, next) {
    try {
      const studentId = req.user.student_id;
      const enrollmentId = parseInt(req.params.id);
      const { cancel_reason } = req.body;

      const enrollment = await enrollmentService.cancel(
        studentId,
        enrollmentId,
        cancel_reason
      );

      res.status(200).json({
        success: true,
        message: 'Hủy đăng ký học phần thành công',
        data: { enrollment },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/enrollments/my
   * Query: { semester_id? }
   */
  async getMyEnrollments(req, res, next) {
    try {
      const studentId = req.user.student_id;
      const { semester_id } = req.query;

      const enrollments = await enrollmentService.getStudentEnrollments(
        studentId,
        semester_id ? parseInt(semester_id) : null
      );

      res.status(200).json({
        success: true,
        data: { enrollments },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EnrollmentController();
