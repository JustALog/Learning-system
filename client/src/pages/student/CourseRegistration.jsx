import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function CourseRegistration() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const semData = await api.get('/semesters/current');
      if (semData.success) {
        const semester = semData.data.semester;
        setCurrentSemester(semester);

        const sectionsData = await api.get(`/sections?semester_id=${semester.semester_id}`);
        const myEnrollData = await api.get(`/enrollments/my?semester_id=${semester.semester_id}`);
        
        if (sectionsData.success && myEnrollData.success) {
          setEnrollments(myEnrollData.data.enrollments);
          setCourses(sectionsData.data.sections);
        }
      }
    } catch (err) {
      console.error('Failed to fetch registration data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCredits = enrollments.reduce((sum, e) => sum + (e.section?.course?.credits || 0), 0);
  const maxCredits = 21;

  const handleRegister = async (sectionId) => {
    try {
      const data = await api.post('/enrollments', { section_id: sectionId });
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Đăng ký thất bại: ' + err.message);
    }
  };

  const handleCancel = async (sectionId) => {
    const enrollment = enrollments.find(e => e.section_id === sectionId);
    if (!enrollment) return;

    try {
      const data = await api.put(`/enrollments/${enrollment.enrollment_id}/cancel`, {
        cancel_reason: 'Sinh viên chủ động hủy'
      });
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Hủy thất bại: ' + err.message);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.section_code.toLowerCase().includes(search.toLowerCase()) ||
      c.course?.course_name.toLowerCase().includes(search.toLowerCase())
  );

  const getProgressClass = (enrolled, capacity) => {
    const ratio = enrolled / capacity;
    if (ratio >= 1) return 'full';
    if (ratio >= 0.8) return 'warning';
    return 'ok';
  };

  const formatSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) return 'Chưa xếp lịch';
    return schedules.map(s => {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return `${days[s.day_of_week - 1]} (${s.start_period}-${s.end_period})`;
    }).join(', ');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Đăng ký học phần</h1>
          <p className="semester-info">{currentSemester?.semester_name || 'Học kỳ ...'}</p>
        </div>
        <div className="credit-summary">
          <span>Tín chỉ: <strong>{totalCredits}</strong> / {maxCredits}</span>
          <div className="credit-bar">
            <div className="credit-bar-fill" style={{ width: `${(totalCredits / maxCredits) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="search-bar">
          <div className="search-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm mã lớp, tên môn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-registration"
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã lớp</th>
              <th>Tên môn học</th>
              <th className="center">TC</th>
              <th>Lịch học</th>
              <th className="center">Sĩ số</th>
              <th className="right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="center">Đang tải...</td></tr>
            ) : filteredCourses.length === 0 ? (
              <tr><td colSpan="6" className="center">Không tìm thấy lớp học phần nào</td></tr>
            ) : filteredCourses.map((course) => {
              const pClass = getProgressClass(course.current_students, course.max_students);
              const isFull = course.current_students >= course.max_students;
              const isRegistered = enrollments.some(e => e.section_id === course.section_id);

              return (
                <tr key={course.section_id}>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{course.section_code}</td>
                  <td>
                    <div>{course.course?.course_name}</div>
                    <div className="sub-text">
                      {course.lecturer_name}
                      {course.course?.prerequisite_id && (
                        <>
                          &nbsp;
                          <span className="tag tag-red">
                            Tiên quyết: {course.course.prerequisite_id}
                          </span>
                        </>
                      )}
                      &nbsp;
                      <span className="tag tag-blue">Môn: {course.course_id}</span>
                    </div>
                  </td>
                  <td className="center">{course.course?.credits}</td>
                  <td>
                    <div className="schedule-info">
                      <div className="schedule-info-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                        </svg>
                        {formatSchedule(course.schedules)}
                      </div>
                      <div className="schedule-info-item room">{course.room}</div>
                    </div>
                  </td>
                  <td className="center">
                    <div className="progress-container">
                      <div className={`progress-text ${pClass}`}>
                        {course.current_students} / {course.max_students}
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${pClass}`}
                          style={{ width: `${Math.min((course.current_students / course.max_students) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="right">
                    {isRegistered ? (
                      <button className="btn-cancel" onClick={() => handleCancel(course.section_id)}>
                        ✕ Hủy
                      </button>
                    ) : isFull ? (
                      <button className="btn-register disabled" disabled title="Lớp đã đầy">
                        Đăng ký
                      </button>
                    ) : (
                      <button className="btn-register" onClick={() => handleRegister(course.section_id)}>
                        Đăng ký
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {enrollments.length > 0 && (
        <div className="registration-results">
          <div className="results-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Kết quả đăng ký ({enrollments.length} môn)
          </div>
          <div className="results-grid">
            {enrollments.map((en) => (
              <div key={en.enrollment_id} className="result-card">
                <div className="result-card-header">
                  <span className="result-card-code">{en.section?.section_code}</span>
                  <span className="badge badge-green">Thành công</span>
                </div>
                <div className="result-card-name">{en.section?.course?.course_name}</div>
                <div className="result-card-footer">
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    {en.section?.course?.credits} TC
                  </span>
                  <span>{en.section?.room}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
