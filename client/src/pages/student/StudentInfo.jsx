import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

export default function StudentInfo() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get('/enrollments/my');
        if (data.success) {
          setEnrollments(data.data.enrollments);
        }
      } catch (err) {
        console.error('Failed to fetch enrollments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalCredits = enrollments.reduce((sum, e) => sum + (e.Section?.Course?.credits || 0), 0);
  
  const stats = [
    { label: 'Tín chỉ tích lũy', value: student.accumulated_credits || 0, max: 120, color: 'blue', icon: 'credits' },
    { label: 'Điểm trung bình', value: student.gpa || 0, max: 4, color: 'green', icon: 'gpa' },
    { label: 'Số môn đã đăng ký', value: enrollments.length, max: 8, color: 'orange', icon: 'courses' },
    { label: 'Tổng tín chỉ học kỳ', value: totalCredits, max: 21, color: 'purple', icon: 'time' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Tổng quan sinh viên</h1>
        </div>
        <div className="btn-outline" style={{ cursor: 'default' }}>
          Học kỳ 1 - Năm học 2026-2027
        </div>
      </div>

      {/* Student Banner */}
      <div className="student-overview">
        <div className="student-banner">
          <div className="student-avatar-large">N</div>
          <div className="student-banner-info">
            <h2>{student.full_name}</h2>
            <div className="student-id">{student.student_id}</div>
          </div>
          <div className="banner-action">
            <button className="btn-banner" onClick={() => navigate('/student/grades')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Kết quả học tập
            </button>
          </div>
        </div>
        <div className="student-details">
          <div className="student-detail-item">
            <label>Chuyên ngành</label>
            <span>{student.major}</span>
          </div>
          <div className="student-detail-item">
            <label>Khóa học</label>
            <span>K{student.academic_year || '---'}</span>
          </div>
          <div className="student-detail-item">
            <label>Email</label>
            <span>{student.email}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className={`stat-card-icon ${stat.color}`}>
              <span style={{ fontSize: 18 }}>{stat.icon}</span>
            </div>
            <div className="stat-card-label">{stat.label}</div>
            <div className="stat-card-value">
              {stat.value}
              <small>/ {stat.max}</small>
            </div>
            <div className="stat-card-bar">
              <div
                className={`stat-card-bar-fill ${stat.color}`}
                style={{ width: `${(stat.value / stat.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Registered Courses */}
      <div className="registered-courses">
        <div className="registered-header">
          <h3>Các học phần đã đăng ký</h3>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/student/registration'); }}>
            Xem chi tiết →
          </a>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã HP</th>
              <th>Tên học phần</th>
              <th className="center">Tín chỉ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="center">Đang tải...</td></tr>
            ) : enrollments.length === 0 ? (
              <tr><td colSpan="4" className="center">Chưa đăng ký môn học nào</td></tr>
            ) : enrollments.map((en) => (
              <tr key={en.enrollment_id}>
                <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{en.Section?.Course?.course_id}</td>
                <td>{en.Section?.Course?.course_name}</td>
                <td className="center">{en.Section?.Course?.credits}</td>
                <td>
                  {en.status === 'enrolled' ? (
                    <span className="badge badge-green">● Thành công</span>
                  ) : (
                    <span className="badge badge-orange">● {en.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
