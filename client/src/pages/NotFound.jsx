import { Link } from 'react-router-dom';

export default function NotFound({ role }) {
  const homePath = role === 'admin' ? '/admin/courses' : '/student/registration';

  return (
    <div className="not-found-wrapper">
      <div className="not-found-content">
        <div className="not-found-404">404</div>
        <h1>Úi! Trang không tồn tại</h1>
        <p>Chúng tôi không thể tìm thấy trang bạn đang yêu cầu. Vui lòng kiểm tra lại URL hoặc quay lại trang chủ.</p>
        <Link to={homePath} className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Quay lại trang chủ
        </Link>
      </div>
      
      {/* Decorative Circles */}
      <div className="not-found-circle circle-1"></div>
      <div className="not-found-circle circle-2"></div>
    </div>
  );
}
