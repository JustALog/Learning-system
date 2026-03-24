/**
 * Unit tests for Schedule Conflict Detection
 *
 * Tests the _isConflict method of ScheduleService
 * which implements BR04 (no overlapping schedules).
 */

const scheduleService = require('../src/services/schedule.service');

describe('Schedule Conflict Detection (_isConflict)', () => {
  // ─── Same day, overlapping periods ───
  test('should detect conflict: same day, fully overlapping periods', () => {
    const a = { day_of_week: 2, start_period: 1, end_period: 3, week_type: 'all' };
    const b = { day_of_week: 2, start_period: 1, end_period: 3, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  test('should detect conflict: same day, partial overlap at start', () => {
    const a = { day_of_week: 3, start_period: 2, end_period: 5, week_type: 'all' };
    const b = { day_of_week: 3, start_period: 4, end_period: 7, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  test('should detect conflict: same day, partial overlap at end', () => {
    const a = { day_of_week: 4, start_period: 5, end_period: 8, week_type: 'all' };
    const b = { day_of_week: 4, start_period: 3, end_period: 6, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  test('should detect conflict: one schedule contained in another', () => {
    const a = { day_of_week: 2, start_period: 1, end_period: 10, week_type: 'all' };
    const b = { day_of_week: 2, start_period: 3, end_period: 5, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  test('should detect conflict: touching at boundary (end == start)', () => {
    const a = { day_of_week: 5, start_period: 1, end_period: 3, week_type: 'all' };
    const b = { day_of_week: 5, start_period: 3, end_period: 5, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  // ─── Same day, non-overlapping periods ───
  test('should NOT conflict: same day, adjacent periods (no overlap)', () => {
    const a = { day_of_week: 2, start_period: 1, end_period: 3, week_type: 'all' };
    const b = { day_of_week: 2, start_period: 4, end_period: 6, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(false);
  });

  test('should NOT conflict: same day, separated periods', () => {
    const a = { day_of_week: 3, start_period: 1, end_period: 2, week_type: 'all' };
    const b = { day_of_week: 3, start_period: 7, end_period: 9, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(false);
  });

  // ─── Different days ───
  test('should NOT conflict: different days, same periods', () => {
    const a = { day_of_week: 2, start_period: 1, end_period: 3, week_type: 'all' };
    const b = { day_of_week: 3, start_period: 1, end_period: 3, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(false);
  });

  test('should NOT conflict: different days, overlapping periods', () => {
    const a = { day_of_week: 4, start_period: 3, end_period: 6, week_type: 'all' };
    const b = { day_of_week: 6, start_period: 4, end_period: 7, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(false);
  });

  // ─── Week type: odd vs even ───
  test('should NOT conflict: odd vs even weeks on same day/period', () => {
    const a = { day_of_week: 2, start_period: 1, end_period: 3, week_type: 'odd' };
    const b = { day_of_week: 2, start_period: 1, end_period: 3, week_type: 'even' };
    expect(scheduleService._isConflict(a, b)).toBe(false);
  });

  test('should NOT conflict: even vs odd weeks on same day/period', () => {
    const a = { day_of_week: 5, start_period: 4, end_period: 6, week_type: 'even' };
    const b = { day_of_week: 5, start_period: 4, end_period: 6, week_type: 'odd' };
    expect(scheduleService._isConflict(a, b)).toBe(false);
  });

  // ─── Week type: all vs odd/even ───
  test('should detect conflict: all vs odd on same day/period', () => {
    const a = { day_of_week: 2, start_period: 1, end_period: 3, week_type: 'all' };
    const b = { day_of_week: 2, start_period: 1, end_period: 3, week_type: 'odd' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  test('should detect conflict: all vs even on same day/period', () => {
    const a = { day_of_week: 3, start_period: 5, end_period: 7, week_type: 'all' };
    const b = { day_of_week: 3, start_period: 5, end_period: 7, week_type: 'even' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  test('should detect conflict: odd vs all on same day/period', () => {
    const a = { day_of_week: 4, start_period: 1, end_period: 4, week_type: 'odd' };
    const b = { day_of_week: 4, start_period: 2, end_period: 5, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  // ─── Week type: same odd/even ───
  test('should detect conflict: both odd on same day/period', () => {
    const a = { day_of_week: 6, start_period: 1, end_period: 3, week_type: 'odd' };
    const b = { day_of_week: 6, start_period: 2, end_period: 4, week_type: 'odd' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  test('should detect conflict: both even on same day/period', () => {
    const a = { day_of_week: 7, start_period: 7, end_period: 9, week_type: 'even' };
    const b = { day_of_week: 7, start_period: 8, end_period: 10, week_type: 'even' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  // ─── Edge cases ───
  test('should detect conflict: single period overlap', () => {
    const a = { day_of_week: 2, start_period: 5, end_period: 5, week_type: 'all' };
    const b = { day_of_week: 2, start_period: 5, end_period: 5, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  test('should NOT conflict: single period, different single periods', () => {
    const a = { day_of_week: 2, start_period: 5, end_period: 5, week_type: 'all' };
    const b = { day_of_week: 2, start_period: 6, end_period: 6, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(false);
  });

  test('should handle Sunday (day_of_week = 8)', () => {
    const a = { day_of_week: 8, start_period: 1, end_period: 3, week_type: 'all' };
    const b = { day_of_week: 8, start_period: 2, end_period: 4, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(true);
  });

  test('should NOT conflict: Sunday vs Saturday', () => {
    const a = { day_of_week: 8, start_period: 1, end_period: 3, week_type: 'all' };
    const b = { day_of_week: 7, start_period: 1, end_period: 3, week_type: 'all' };
    expect(scheduleService._isConflict(a, b)).toBe(false);
  });
});
