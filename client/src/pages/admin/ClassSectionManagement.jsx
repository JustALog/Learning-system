import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { api } from '../../utils/api';

export default function ClassSectionManagement() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await api.get('/sections');
      if (data.success) {
        setSections(data.data.sections);
      }
    } catch (err) {
      setError('Không thể tải danh sách lớp học phần');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const filteredSections = sections.filter(
    (s) =>
      s.section_code.toLowerCase().includes(search.toLowerCase()) ||
      s.course?.course_name.toLowerCase().includes(search.toLowerCase())
  );

  const openEditModal = (section) => {
    setFormData({ 
      ...section,
      course_name: section.course?.course_name || '',
      credits: section.course?.credits || 0
    });
    setEditModal(section.section_id);
  };

  const saveEdit = async () => {
    try {
      const body = {
        max_students: parseInt(formData.max_students),
        lecturer_name: formData.lecturer_name,
        room: formData.room,
        status: formData.status
      };
      const data = await api.put(`/sections/${editModal}`, body);
      if (data.success) {
        setSections(sections.map((s) => (s.section_id === editModal ? data.data.section : s)));
        setEditModal(null);
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const deleteSection = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học phần này?')) {
      alert('Chức năng xóa hiện chưa khả dụng phía máy chủ');
    }
  };

  const getStatusBadge = (section) => {
    if (section.status === 'cancelled') return <span className="badge badge-red">● Đã hủy</span>;
    if (section.current_students >= section.max_students) return <span className="badge badge-red">● Đã đầy</span>;
    return <span className="badge badge-green">● Mở</span>;
  };

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

  if (loading && sections.length === 0) {
    return <div className="loading">Đang tải lớp học phần...</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Quản lý lớp học phần</h1>
          <p>Quản lý danh mục lớp học phần trong kỳ học</p>
        </div>
        <button className="btn-primary" id="btn-add-section">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm lớp mới
        </button>
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
              id="search-sections"
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã lớp</th>
              <th>Tên môn học</th>
              <th className="center">TC</th>
              <th>Lịch học / Phòng</th>
              <th className="center">Đăng ký</th>
              <th className="center">Trạng thái</th>
              <th className="right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSections.map((section) => {
              const pClass = getProgressClass(section.current_students, section.max_students);
              return (
                <tr key={section.section_id}>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{section.section_code}</td>
                  <td>
                    <div>{section.course?.course_name}</div>
                    <div className="sub-text">
                      {section.lecturer_name} &nbsp;
                      <span className="tag tag-blue">Môn: {section.course_id}</span>
                    </div>
                  </td>
                  <td className="center">{section.course?.credits}</td>
                  <td>
                    <div>{formatSchedule(section.schedules)}</div>
                    <div className="sub-text">{section.room}</div>
                  </td>
                  <td className="center">
                    <div className="progress-container">
                      <div className={`progress-text ${pClass}`}>
                        {section.current_students} / {section.max_students}
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${pClass}`}
                          style={{ width: `${Math.min((section.current_students / section.max_students) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="center">{getStatusBadge(section)}</td>
                  <td className="right">
                    <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn-icon edit" onClick={() => openEditModal(section)} title="Sửa">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn-icon delete" onClick={() => deleteSection(section.section_id)} title="Xóa">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="table-footer">
          Hiển thị {filteredSections.length} / {sections.length} lớp học phần
        </div>
      </div>

      {editModal && (
        <Modal title="Sửa lớp học phần" onClose={() => setEditModal(null)}>
          <div className="modal-body">
            <div className="form-group">
              <label>Mã lớp</label>
              <input className="readonly" value={formData.section_code} readOnly />
            </div>
            <div className="form-group">
              <label>Tên môn học</label>
              <input className="readonly" value={formData.course_name} readOnly />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Sĩ số tối đa</label>
                <input type="number" value={formData.max_students} onChange={(e) => setFormData({ ...formData, max_students: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phòng học</label>
                <input value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Giảng viên</label>
              <input value={formData.lecturer_name} onChange={(e) => setFormData({ ...formData, lecturer_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="open">Mở</option>
                <option value="closed">Đóng</option>
                <option value="cancelled">Hủy lớp</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-modal-cancel" onClick={() => setEditModal(null)}>Hủy</button>
            <button className="btn-modal-save" onClick={saveEdit}>Lưu thay đổi</button>
          </div>
        </Modal>
      )}
    </>
  );
}
