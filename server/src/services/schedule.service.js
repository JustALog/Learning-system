const { Schedule, Enrollment, Section } = require('../models');
const { Op } = require('sequelize');

class ScheduleService {
  /**
   * Check if a new section's schedule conflicts with the student's existing enrollments.
   *
   * Two schedules conflict when:
   * 1. Same day_of_week
   * 2. Overlapping periods (start_period <= other.end_period AND end_period >= other.start_period)
   * 3. Compatible week_type (both 'all', or same odd/even, or one is 'all')
   *
   * @param {string} studentId - Student ID
   * @param {number} targetSectionId - The section the student wants to enroll in
   * @param {number} semesterId - The semester to check within
   * @returns {Array} Array of conflict objects, empty if no conflicts
   */
  async checkConflicts(studentId, targetSectionId, semesterId) {
    // 1. Get schedules of the target section
    const targetSchedules = await Schedule.findAll({
      where: { section_id: targetSectionId },
    });

    if (targetSchedules.length === 0) {
      return []; // No schedules defined → no conflict possible
    }

    // 2. Get all sections the student is currently enrolled in (same semester, status = 'enrolled')
    const enrolledSections = await Enrollment.findAll({
      where: {
        student_id: studentId,
        status: 'enrolled',
      },
      include: [
        {
          model: Section,
          as: 'section',
          where: { semester_id: semesterId },
          include: [
            {
              model: Schedule,
              as: 'schedules',
            },
          ],
        },
      ],
    });

    const conflicts = [];

    // 3. For each target schedule, check against all enrolled schedules
    for (const targetSch of targetSchedules) {
      for (const enrollment of enrolledSections) {
        const section = enrollment.section;
        for (const existingSch of section.schedules) {
          if (this._isConflict(targetSch, existingSch)) {
            conflicts.push({
              target_schedule: {
                section_id: targetSectionId,
                day_of_week: targetSch.day_of_week,
                start_period: targetSch.start_period,
                end_period: targetSch.end_period,
                week_type: targetSch.week_type,
              },
              conflict_with: {
                section_id: section.section_id,
                section_code: section.section_code,
                day_of_week: existingSch.day_of_week,
                start_period: existingSch.start_period,
                end_period: existingSch.end_period,
                week_type: existingSch.week_type,
              },
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Determine if two schedule entries conflict.
   * Exported for unit testing.
   *
   * @param {Object} a - Schedule A: { day_of_week, start_period, end_period, week_type }
   * @param {Object} b - Schedule B: { day_of_week, start_period, end_period, week_type }
   * @returns {boolean} true if they conflict
   */
  _isConflict(a, b) {
    // Must be the same day
    if (a.day_of_week !== b.day_of_week) {
      return false;
    }

    // Check period overlap: [startA, endA] ∩ [startB, endB] ≠ ∅
    const periodsOverlap =
      a.start_period <= b.end_period && a.end_period >= b.start_period;

    if (!periodsOverlap) {
      return false;
    }

    // Check week_type compatibility
    // 'odd' and 'even' never overlap with each other
    // 'all' overlaps with everything
    if (a.week_type === 'odd' && b.week_type === 'even') return false;
    if (a.week_type === 'even' && b.week_type === 'odd') return false;

    return true;
  }
}

module.exports = new ScheduleService();
