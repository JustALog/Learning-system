import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function RegistrationTracking() {
  const [activeTab, setActiveTab] = useState('cancel');
  const [search, setSearch] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/enrollments/requests');
      if (data.success) {
        setEnrollments(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const pendingCount = enrollments.filter((r) => r.status === 'pending').length;

  const updateStatus = async (id, status) => {
    try {
      const data = await api.put(`/admin/enrollments/${id}/status`, { status });
      if (data.success) {
        setEnrollments(enrollments.map(e => e.enrollment_id === id ? { ...e, status } : e));
      }
    } catch (err) {
      alert('Cập nhật thất bại: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-orange">⏳ Chờ duyệt</span>;
      case 'enrolled':
        return <span className="badge badge-green">✓ Đã đăng ký</span>;
      case 'cancelled':
        return <span className="badge badge-red">✕ Đã hủy</span>;
      case 'completed':
        return <span className="badge badge-blue">[COMPLETED] Đã hoàn thành</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const filteredEnrollments = enrollments.filter(e => 
    e.student?.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.student?.student_id.toLowerCase().includes(search.toLowerCase()) ||
    e.section?.section_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Theo dõi tình hình đăng ký</h1>
          <p>Xử lý yêu cầu hủy đăng ký và quản lý trạng thái sinh viên</p>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'cancel' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancel')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            Yêu cầu hủy đăng ký
            {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Trạng thái sinh viên
          </button>
        </div>

        <div className="search-bar">
          <div className="search-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={activeTab === 'cancel' ? 'Tìm sinh viên, mã SV, mã lớp...' : 'Tìm kiếm sinh viên...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-tracking"
            />
          </div>
        </div>

        {activeTab === 'cancel' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Lớp học phần</th>
                <th className="center">Ngày đăng ký</th>
                <th className="center">Trạng thái</th>
                <th className="right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="center">Đang tải...</td></tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr><td colSpan="5" className="center">Không có bản ghi nào</td></tr>
              ) : filteredEnrollments.map((en) => (
                <tr key={en.enrollment_id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{en.student?.full_name}</div>
                    <div className="sub-text" style={{ color: 'var(--primary)' }}>{en.student?.student_id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{en.section?.section_code}</div>
                    <div className="sub-text">{en.section?.course?.course_name}</div>
                  </td>
                  <td className="center">{new Date(en.enrolled_at).toLocaleDateString('vi-VN')}</td>
                  <td className="center">{getStatusBadge(en.status)}</td>
                  <td className="right">
                    <select 
                      className="status-select"
                      value={en.status}
                      onChange={(e) => updateStatus(en.enrollment_id, e.target.value)}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="enrolled">Duyệt ĐK</option>
                      <option value="cancelled">Hủy ĐK</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="placeholder-view">
            <p>Chức năng quản lý hồ sơ sinh viên và khóa tài khoản nằm trong module <strong>Quản lý Sinh viên</strong>.</p>
            <p>Module này hiện chỉ tập trung theo dõi tiến độ đăng ký học phần.</p>
          </div>
        )}
      </div>
    </>
  );
}
