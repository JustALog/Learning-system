const { Result, Course, Semester } = require('../models');
const ApiError = require('../utils/ApiError');

class ResultController {
  /**
   * GET /api/results/my
   * Lấy kết quả học tập của sinh viên đang đăng nhập
   */
  async getMyResults(req, res, next) {
    try {
      const studentId = req.user.student_id;
      const { semester_id } = req.query;

      const where = { student_id: studentId };
      if (semester_id) where.semester_id = semester_id;

      const results = await Result.findAll({
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
            attributes: ['semester_id', 'semester_name', 'academic_year'],
          },
        ],
        order: [
          [{ model: Semester, as: 'semester' }, 'academic_year', 'DESC'],
          [{ model: Semester, as: 'semester' }, 'semester_number', 'DESC'],
        ],
      });

      // Calculate GPA for the response if needed, or let frontend do it
      // For now, just return raw results

      res.status(200).json({
        success: true,
        data: { results },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/results/stats
   * Lấy thống kê điểm số (GPA, tín chỉ tích lũy)
   */
  async getMyResultStats(req, res, next) {
    try {
      const studentId = req.user.student_id;
      
      const results = await Result.findAll({
        where: { student_id: studentId },
        include: [{ model: Course, as: 'course' }]
      });

      // Simple GPA calculation
      let totalPoints = 0;
      let totalCredits = 0;
      let accumulatedCredits = 0;

      results.forEach(r => {
        if (r.total_score !== null && r.status === 'pass') {
          const credits = r.course.credits;
          accumulatedCredits += credits;
          
          // GPA logic (simplified: mapping score to 4.0 scale)
          // 8.5-10: 4.0, 7.0-8.4: 3.0, 5.5-6.9: 2.0, 4.0-5.4: 1.0, <4: 0
          let gpaPoint = 0;
          if (r.total_score >= 8.5) gpaPoint = 4.0;
          else if (r.total_score >= 7.0) gpaPoint = 3.0;
          else if (r.total_score >= 5.5) gpaPoint = 2.0;
          else if (r.total_score >= 4.0) gpaPoint = 1.0;
          
          totalPoints += gpaPoint * credits;
          totalCredits += credits;
        }
      });

      const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;

      res.status(200).json({
        success: true,
        data: {
          gpa: parseFloat(gpa),
          accumulatedCredits,
          totalCourses: results.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResultController();
