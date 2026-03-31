import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { api } from '../../utils/api';

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDatesModal, setEditDatesModal] = useState(null);
  const [editRegModal, setEditRegModal] = useState(null);
  const [dateForm, setDateForm] = useState({ start_date: '', end_date: '' });
  const [regForm, setRegForm] = useState({ reg_open: '', reg_close: '' });

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const data = await api.get('/semesters');
      if (data.success) {
        setSemesters(data.data.semesters);
      }
    } catch (err) {
      setError('Không thể tải danh sách học kỳ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const openEditDates = (sem) => {
    setDateForm({ start_date: sem.start_date, end_date: sem.end_date });
    setEditDatesModal(sem.semester_id);
  };

  const openEditReg = (sem) => {
    // Format ISO string to datetime-local format (YYYY-MM-DDTHH:MM)
    const formatForInput = (isoStr) => isoStr ? new Date(isoStr).toISOString().slice(0, 16) : '';
    setRegForm({ 
      reg_open: formatForInput(sem.reg_open), 
      reg_close: formatForInput(sem.reg_close) 
    });
    setEditRegModal(sem.semester_id);
  };

  const saveDates = async () => {
    try {
      const data = await api.put(`/semesters/${editDatesModal}`, dateForm);
      if (data.success) {
        setSemesters(semesters.map((s) => (s.semester_id === editDatesModal ? data.data.semester : s)));
        setEditDatesModal(null);
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const saveReg = async () => {
    try {
      const data = await api.put(`/semesters/${editRegModal}`, regForm);
      if (data.success) {
        setSemesters(semesters.map((s) => (s.semester_id === editRegModal ? data.data.semester : s)));
        setEditRegModal(null);
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const setCurrent = async (id) => {
    try {
      const data = await api.put(`/semesters/${id}`, { is_current: true });
      if (data.success) {
        fetchSemesters();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const getRegStatus = (regOpen, regClose) => {
    const now = new Date();
    const start = new Date(regOpen);
    const end = new Date(regClose);
    if (now < start) return 'SẮP MỞ';
    if (now > end) return 'ĐÃ ĐÓNG';
    return 'ĐANG MỞ';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN');
  };

  if (loading && semesters.length === 0) {
    return <div className="loading">Đang tải học kỳ...</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Quản lý học kỳ</h1>
          <p>Thiết lập học kỳ hiện tại và thời gian đăng ký</p>
        </div>
        <button className="btn-primary" id="btn-add-semester">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm học kỳ mới
        </button>
      </div>

      <div className="semester-grid">
        {semesters.map((sem) => (
          <div key={sem.semester_id} className={`semester-card ${sem.is_current ? 'current' : ''}`}>
            <div className="semester-header">
              <div>
                <div className="semester-title">{sem.semester_name}</div>
                <div className="semester-year">Năm học {sem.academic_year}</div>
              </div>
              {sem.is_current ? (
                <span className="badge-current">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  HỌC KỲ HIỆN TẠI
                </span>
              ) : (
                <button className="btn-set-current" onClick={() => setCurrent(sem.semester_id)}>
                  Đặt làm hiện tại
                </button>
              )}
            </div>

            <div className="semester-section">
              <div className="semester-section-header">
                <div className="semester-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Thời gian học kỳ
                </div>
                <button className="btn-icon edit" onClick={() => openEditDates(sem)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <div className="semester-dates">
                <div className="semester-date-item">
                  <label>Ngày bắt đầu</label>
                  <span>{formatDate(sem.start_date)}</span>
                </div>
                <div className="semester-date-item">
                  <label>Ngày kết thúc</label>
                  <span>{formatDate(sem.end_date)}</span>
                </div>
              </div>
            </div>

            <div className="semester-section">
              <div className="semester-section-header">
                <div className="semester-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  Thời gian đăng ký học phần
                </div>
                <button className="btn-icon edit" onClick={() => openEditReg(sem)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <div className="registration-period">
                <div className="registration-period-header">
                  <span className={`registration-status ${getRegStatus(sem.reg_open, sem.reg_close) === 'ĐANG MỞ' ? 'open' : ''}`}>
                    {getRegStatus(sem.reg_open, sem.reg_close)}
                  </span>
                  <span className="registration-wave">Đợt duy nhất</span>
                </div>
                <div className="registration-dates">
                  <div className="reg-date">
                    <span className="reg-date-label">Từ</span>
                    <span className="reg-date-value">{formatDateTime(sem.reg_open)}</span>
                  </div>
                  <div className="reg-date">
                    <span className="reg-date-label">Đến</span>
                    <span className="reg-date-value">{formatDateTime(sem.reg_close)}</span>
                  </div>
                </div>
              </div>
              {sem.is_current && (
                <div className="semester-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Sinh viên chỉ được đăng ký trong thời gian này
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editDatesModal && (
        <Modal title="Cập nhật thời gian học" onClose={() => setEditDatesModal(null)}>
          <div className="modal-body">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input type="date" value={dateForm.start_date} onChange={(e) => setDateForm({ ...dateForm, start_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input type="date" value={dateForm.end_date} onChange={(e) => setDateForm({ ...dateForm, end_date: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-modal-cancel" onClick={() => setEditDatesModal(null)}>Hủy</button>
            <button className="btn-modal-save" onClick={saveDates}>Lưu thay đổi</button>
          </div>
        </Modal>
      )}

      {editRegModal && (
        <Modal title="Cập nhật thời gian đăng ký" onClose={() => setEditRegModal(null)}>
          <div className="modal-body">
            <div className="form-group">
              <label>Thời điểm mở đăng ký</label>
              <input type="datetime-local" value={regForm.reg_open} onChange={(e) => setRegForm({ ...regForm, reg_open: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Thời điểm đóng đăng ký</label>
              <input type="datetime-local" value={regForm.reg_close} onChange={(e) => setRegForm({ ...regForm, reg_close: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-modal-cancel" onClick={() => setEditRegModal(null)}>Hủy</button>
            <button className="btn-modal-save" onClick={saveReg}>Lưu thay đổi</button>
          </div>
        </Modal>
      )}
    </>
  );
}
