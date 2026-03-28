# Hệ thống Quản lý và Đăng ký Học phần

Hệ thống cung cấp nền tảng toàn diện cho sinh viên đăng ký môn học và quản trị viên quản lý quy trình đào tạo, bao gồm quản lý môn học, học kỳ, lớp học phần, và theo dõi kết quả học tập.

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

### Frontend
- **Framework:** React 18 + JSX
- **Build Tool:** Vite (HMR support, fast bundling)
- **Routing:** React Router DOM v6
- **Animations:** Framer Motion
- **UI Components:** Custom CSS Glassmorphism UI style
- **Icons:** Lucide React
- **Development:** ESLint, Hot Module Replacement (HMR)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **ORM:** Sequelize 6 (SQL query builder)
- **Validation:** Express-validator
- **Error Handling:** Custom error middleware

### Database
- **DBMS:** MySQL 8.0+ / MariaDB 10.6+
- **Character Set:** utf8mb4
- **Collation:** utf8mb4_unicode_ci

### Security
- **Authentication:** JWT (JSON Web Tokens)
- **Authorization:** Role-based access control (Student/Admin)
- **Password:** Bcrypt hashing (salt rounds: 10)
- **CORS:** Configured for secure cross-origin requests

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

## Yêu cầu hệ thống

- **Node.js:** v18.0.0 trở lên
- **npm:** v9.0.0 trở lên (hoặc yarn/pnpm)
- **MySQL:** v8.0.0 trở lên
- **RAM:** Tối thiểu 2GB cho development
- **Disk Space:** Tối thiểu 500MB

## Cấu trúc thư mục chi tiết

```
Course-management-system/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page components (Login, Admin, Student)
│   │   ├── context/             # React Context (Theme)
│   │   ├── assets/              # Images, fonts
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React DOM render entry
│   │   └── App.css              # Global styles
│   ├── public/                  # Static assets
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite configuration
│
├── server/                      # Backend Express application
│   ├── migrations/
│   │   └── init.sql             # Database schema initialization
│   ├── src/
│   │   ├── config/              # Database & environment config
│   │   ├── models/              # Sequelize ORM models
│   │   ├── controllers/         # Request handlers
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic layer
│   │   ├── middleware/          # Auth, error handling, validation
│   │   ├── utils/               # Helper functions
│   │   ├── seeders/             # Initial data population
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Server entry point
│   ├── package.json             # Backend dependencies
│   └── .env.example             # Environment variables template
│
├── docs/                        # Documentation
│   ├── README.md                # Project overview
│   ├── BACKEND.md               # Backend API documentation
│   └── DATABASE.md              # Database schema documentation
│
├── docker-compose.yml           # Docker database setup
├── package.json                 # Root package.json (npm workspaces)
└── test-env.js                  # Environment testing utility
```

## 🔑 Tài khoản kiểm thử (Default Test Accounts)

Sau khi chạy lệnh `npm run seed`, bạn có thể sử dụng các tài khoản sau để trải nghiệm hệ thống:

|Account|Password|Role|Trạng thái|
|-------|--------|----|---------|
|20IT005|123456|Student|Active|
|21BA001|123456|Student|Active|
|21BA002|123456|Student|Active|
|21IT001|123456|Student|Active|
|21IT002|123456|Student|Active|
|21IT003|123456|Student|Active|
|22CS001|123456|Student|Active|
|22EE001|123456|Student|Active|
|22SE001|123456|Student|Active|
|23IT001|123456|Student|Active|
|ADMIN001|123456|Admin|Active|
|ADMIN002|123456|Admin|Active|

## Troubleshooting

### Vấn đề kết nối cơ sở dữ liệu
```bash
# Kiểm tra MySQL service
mysql -u root -p

# Kiểm tra file .env
cat server/.env

# Restart server
npm run dev -w server
```

### Vấn đề cổng bị sử dụng
```bash
# Frontend (5173), Backend (5000) hoặc MySQL (3306)
# Windows: netstat -ano | findstr :PORT
# Mac/Linux: lsof -i :PORT
```

### Lỗi permission khi chạy seed
```bash
# Đảm bảo quyền truy cập MySQL
mysql -u root -p -e "SHOW DATABASES;"
```

## Hỗ trợ và Liên hệ

- **Issues:** Báo cáo lỗi trên issue tracker
- **Documentation:** Xem thêm trong thư mục `/docs/`
- **API Endpoints:** Chi tiết API tại [BACKEND.md](BACKEND.md)
- **Database Schema:** Chi tiết schema tại [DATABASE.md](DATABASE.md)