# Hệ thống Quản lý và Đăng ký Học phần

Hệ thống cung cấp nền tảng toàn diện cho sinh viên đăng ký môn học và quản trị viên quản lý đào tạo s

## Cấu trúc dự án

```
/
├── client/                 # Frontend (React 18, Vite, React Router, Framer Motion)
├── server/                 # Backend API (Express.js, Sequelize, MySQL, JWT Auth)
├── package.json            # Cấu hình npm workspaces
└── README.md
```

## Các tính năng chính

### 🎓 Dành cho Sinh viên (Student Portal)
- **Dashboard:** Tổng quan kết quả học tập, tín chỉ tích lũy, GPA.
- **Đăng ký học phần:** Giao diện trực quan chọn lớp, kiểm tra lịch trùng trống.
- **Thời khóa biểu:** Xem lịch học theo tuần.
- **Kết quả học tập:** Theo dõi điểm số từng môn và bảng điểm tổng hợp.

### 🛡️ Dành cho Quản trị viên (Admin Site)
- **Tổng quan (Dashboard):** Thống kê số lượng sinh viên, khóa học, và đăng ký chờ duyệt.
- **Quản lý Môn học:** Xem, thêm, sửa, xóa môn học và thiết lập môn tiên quyết.
- **Quản lý Học kỳ:** Thiết lập học kỳ hiện tại, thời gian bắt đầu/kết thúc và thời gian mở đăng ký.
- **Quản lý Lớp học phần:** Tạo lớp, phân công giảng viên và phòng học.
- **Giám sát đăng ký (Enrollment Monitor):** Theo dõi và quản lý các yêu cầu đăng ký học phần của sinh viên.

## Công nghệ sử dụng

- **Frontend:** React 18, Vite, React Router DOM, Framer Motion (Animations), Lucide React (Icons), Vanilla CSS (Glassmorphism UI).
- **Backend:** Node.js, Express.js.
- **Database / ORM:** MySQL 8.0, Sequelize ORM.
- **Security:** JWT (JSON Web Tokens) role-based authentication (Student/Admin), bcrypt mật khẩu.

## Hướng dẫn cài đặt và chạy thử

### 1. Cài đặt toàn bộ dependencies
Từ thư mục gốc (root), chạy:
```bash
npm install
```

### 2. Cấu hình môi trường (Backend)
Vào thư mục `server/` và tạo file `.env` tham khảo từ `.env.example`:
```bash
cd server
cp .env.example .env
```
Cập nhật thông tin kết nối MySQL (DB_USER, DB_PASSWORD, DB_NAME, v.v.).

### 3. Thiết lập Cơ sở dữ liệu và Dữ liệu mẫu
Khởi tạo cấu trúc bảng thông qua file `server/migrations/init.sql` vào MySQL của bạn, sau đó chạy lệnh seed để tạo dữ liệu mẫu và tài khoản test:
```bash
# Từ thư mục gốc
npm run seed -w server
```

### 4. Khởi động ứng dụng
Từ thư mục gốc, hệ thống hỗ trợ chạy cả client và server song song:
```bash
npm run dev
```
- **Frontend (Client):** http://localhost:5173
- **Backend (API):** http://localhost:5000

---

## 🔑 Tài khoản kiểm thử (Test Accounts)

Sau khi chạy lệnh `npm run seed`, bạn có thể sử dụng các tài khoản sau để trải nghiệm hệ thống:

|Account|Password|Role|
|-------|--------|----|
|20IT005|123456|Student|
|21BA001|123456|Student|
|21BA002|123456|Student|
|21IT001|123456|Student|
|21IT002|123456|Student|
|21IT003|123456|Student|
|22CS001|123456|Student|
|22EE001|123456|Student|
|22SE001|123456|Student|
|23IT001|123456|Student|
|ADMIN001|123456|Admin|
|ADMIN002|123456|Admin|