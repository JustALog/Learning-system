import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { api } from '../../utils/api';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const [formData, setFormData] = useState({ 
    course_id: '', 
    course_name: '', 
    credits: '', 
    prerequisite_id: '',
    department: '',
    is_active: true
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.get('/courses');
      if (data.success) {
        setCourses(data.data.courses);
      }
    } catch (err) {
      setError('Không thể tải danh sách môn học');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (c) =>
      c.course_id.toLowerCase().includes(search.toLowerCase()) ||
      c.course_name.toLowerCase().includes(search.toLowerCase())
  );

  const openEditModal = (course) => {
    setFormData({ 
      ...course,
      prerequisite_id: course.prerequisite_id || ''
    });
    setEditModal(course.course_id);
  };

  const openAddModal = () => {
    setFormData({ 
      course_id: '', 
      course_name: '', 
      credits: '', 
      prerequisite_id: '',
      department: 'Khoa CNTT',
      is_active: true
    });
    setAddModal(true);
  };

  const saveEdit = async () => {
    try {
      const body = { 
        course_name: formData.course_name,
        credits: parseInt(formData.credits),
        prerequisite_id: formData.prerequisite_id || null,
        department: formData.department,
        is_active: formData.is_active
      };
      const data = await api.put(`/courses/${editModal}`, body);
      if (data.success) {
        setCourses(courses.map((c) => (c.course_id === editModal ? data.data.course : c)));
        setEditModal(null);
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const saveAdd = async () => {
    try {
      const body = { 
        ...formData,
        credits: parseInt(formData.credits),
        prerequisite_id: formData.prerequisite_id || null
      };
      const data = await api.post('/courses', body);
      if (data.success) {
        setCourses([...courses, data.data.course]);
        setAddModal(false);
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const deleteCourse = (id) => {
    // Backend doesn't support delete yet in the controller/routes
    alert('Chức năng xóa hiện chưa khả dụng phía máy chủ');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Quản lý danh mục môn học</h1>
          <p>Thêm, sửa, xóa môn học và thiết lập môn tiên quyết</p>
        </div>
        <button className="btn-primary" onClick={openAddModal} id="btn-add-course">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm môn học mới
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
              placeholder="Tìm kiếm mã môn, tên môn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-courses"
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã môn</th>
              <th>Tên môn học</th>
              <th className="center">Tín chỉ</th>
              <th>Môn tiên quyết</th>
              <th className="right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.course_id}>
                <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{course.course_id}</td>
                <td>{course.course_name}</td>
                <td className="center">{course.credits}</td>
                <td style={{ color: 'var(--text-muted)' }}>{course.prerequisite_id || 'Không có'}</td>
                <td className="right">
                  <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                    <span className="tag tag-blue" style={{ cursor: 'pointer', marginRight: 4 }}>
                      Tiên quyết
                    </span>
                    <button className="btn-icon edit" onClick={() => openEditModal(course)} title="Sửa">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="btn-icon delete" onClick={() => deleteCourse(course.course_id)} title="Xóa">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <Modal title="Cập nhật môn học" onClose={() => setEditModal(null)}>
          <div className="modal-body">
            <div className="form-group">
              <label>Mã môn</label>
              <input className="readonly" value={formData.course_id} readOnly />
            </div>
            <div className="form-group">
              <label>Tên môn học</label>
              <input value={formData.course_name} onChange={(e) => setFormData({ ...formData, course_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Số tín chỉ</label>
              <input type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Môn tiên quyết (Mã môn)</label>
              <input placeholder="VD: IT1001" value={formData.prerequisite_id} onChange={(e) => setFormData({ ...formData, prerequisite_id: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-modal-cancel" onClick={() => setEditModal(null)}>Hủy</button>
            <button className="btn-modal-save" onClick={saveEdit}>Lưu thay đổi</button>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {addModal && (
        <Modal title="Thêm môn học mới" onClose={() => setAddModal(false)}>
          <div className="modal-body">
            <div className="form-group">
              <label>Mã môn</label>
              <input placeholder="VD: IT3001" value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Tên môn học</label>
              <input placeholder="VD: Nhập môn Lập trình" value={formData.course_name} onChange={(e) => setFormData({ ...formData, course_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Số tín chỉ</label>
              <input type="number" placeholder="3" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Môn tiên quyết (Mã môn)</label>
              <input placeholder="VD: IT1001" value={formData.prerequisite_id} onChange={(e) => setFormData({ ...formData, prerequisite_id: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-modal-cancel" onClick={() => setAddModal(false)}>Hủy</button>
            <button className="btn-modal-save" onClick={saveAdd}>Thêm môn học</button>
          </div>
        </Modal>
      )}
    </>
  );
}
