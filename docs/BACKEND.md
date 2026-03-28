# Web Quản lý và Đăng ký Học phần - Backend API


Hệ thống quản lý và đăng ký học phần dành cho sinh viên, được phát triển bằng Node.js, Express, Sequelize ORM và cơ sở dữ liệu MySQL. Cung cấp đầy đủ API endpoints cho sinh viên và quản trị viên.

## Công nghệ sử dụng

- Runtime: Node.js
- Framework: Express.js
- ORM: Sequelize 6
- Cơ sở dữ liệu: MySQL 8.0+ (hỗ trợ utf8mb4)
- Xác thực: JWT và Bcrypt
- Kiểm tra dữ liệu: Express-validator

## Cấu trúc thư mục dự án

```
server/
├── package.json              # Các phụ thuộc và script lệnh
├── migrations/
│   └── init.sql              # Script SQL khởi tạo cơ sở dữ liệu
└── src/
    ├── app.js                # Cấu hình ứng dụng Express
    ├── server.js             # Điểm khởi đầu của máy chủ
    ├── config/
    │   └── database.js       # Cấu hình kết nối Sequelize
    ├── models/               # Định nghĩa các mô hình dữ liệu Sequelize
    │   ├── index.js
    │   ├── Admin.js
    │   ├── Student.js
    │   ├── Course.js
    │   ├── Semester.js
    │   ├── Section.js
    │   ├── Schedule.js
    │   ├── Enrollment.js
    │   └── Result.js
    ├── services/             # Xử lý logic nghiệp vụ (BR01-BR09)
    │   ├── auth.service.js
    │   ├── enrollment.service.js
    │   └── schedule.service.js
    ├── controllers/          # Xử lý các yêu cầu từ API
    │   ├── auth.controller.js
    │   ├── admin.controller.js
    │   ├── course.controller.js
    │   ├── enrollment.controller.js
    │   ├── result.controller.js
    │   ├── section.controller.js
    │   ├── semester.controller.js
    │   └── student.controller.js
    ├── routes/               # Khai báo các đường dẫn API
    │   ├── index.js
    │   ├── auth.routes.js
    │   ├── course.routes.js
    │   ├── enrollment.routes.js
    │   ├── result.routes.js
    │   ├── section.routes.js
    │   ├── semester.routes.js
    │   ├── student.routes.js
    │   └── admin.routes.js
    ├── middleware/           # Các hàm trung gian (xác thực, kiểm tra, lỗi)
    │   ├── auth.middleware.js
    │   ├── errorHandler.js
    │   └── validate.js
    ├── utils/                # Các công cụ hỗ trợ
    │   └── ApiError.js       # Lớp xử lý lỗi API
    ├── seeders/
    │   └── seed.js           # Dữ liệu mẫu ban đầu
    └── migrations/
        └── migrate.js        # Trình chạy di cư cơ sở dữ liệu

```

## Deploy server

### 1. Yêu cầu hệ thống

- Node.js phiên bản 18 trở lên
- MySQL phiên bản 8.0 trở lên

### 2. Cài đặt các gói phụ thuộc

```bash
npm install
```

### 3. Cấu hình môi trường

```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin kết nối MySQL của bạn
```

### 4. Tạo cơ sở dữ liệu và bảng

Cách 1: Chạy trực tiếp script SQL di cư:
```bash
mysql -u root -p < migrations/init.sql
```

Cách 2: Sử dụng trình chạy di cư tích hợp:
```bash
cd server
npm run migrate
```

Cách 3: Để Sequelize tự động đồng bộ (chỉ dành cho môi trường phát triển):
```bash
npm run dev
# Các bảng sẽ được tự động tạo khi khởi động
```

### 5. Nạp dữ liệu mẫu

```bash
npm run seed
```

### 6. Khởi động máy chủ

```bash
# Chế độ phát triển (tự động tải lại mã nguồn)
npm run dev

# Chế độ sản xuất
npm start
```

Máy chủ sẽ chạy tại địa chỉ: http://localhost:3000

## Danh sách các API Endpoints

### Xác thực người dùng
| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|-------|
| POST | /api/auth/register | Đăng ký sinh viên mới |
| POST | /api/auth/login | Đăng nhập bằng email và mật khẩu |
| GET | /api/auth/me | Lấy thông tin hồ sơ hiện tại (Yêu cầu Token) |

### Quản lý sinh viên
| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|-------|
| GET | /api/students | Danh sách tất cả sinh viên (Yêu cầu Token) |
| GET | /api/students/:id | Lấy thông tin sinh viên theo ID (Yêu cầu Token) |
| PUT | /api/students/:id | Cập nhật thông tin sinh viên (Yêu cầu Token) |

### Quản lý môn học
| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|-------|
| GET | /api/courses | Danh sách môn học (tìm kiếm, lọc) (Yêu cầu Token) |
| GET | /api/courses/:id | Chi tiết môn học (Yêu cầu Token) |
| POST | /api/courses | Tạo môn học mới (Yêu cầu Token) |
| PUT | /api/courses/:id | Cập nhật thông tin môn học (Yêu cầu Token) |

### Quản lý học kỳ
| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|-------|
| GET | /api/semesters | Danh sách tất cả các học kỳ (Yêu cầu Token) |
| GET | /api/semesters/current | Lấy thông tin học kỳ hiện tại (Yêu cầu Token) |
| GET | /api/semesters/:id | Lấy học kỳ theo ID (Yêu cầu Token) |
| POST | /api/semesters | Tạo học kỳ mới (Yêu cầu Token) |
| PUT | /api/semesters/:id | Cập nhật học kỳ (Yêu cầu Token) |

### Quản lý lớp học phần
| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|-------|
| GET | /api/sections | Danh sách lớp học phần (Yêu cầu Token) |
| GET | /api/sections/:id | Chi tiết lớp học phần và lịch học (Yêu cầu Token) |
| POST | /api/sections | Tạo lớp học phần kèm lịch học (Yêu cầu Token) |
| PUT | /api/sections/:id | Cập nhật thông tin lớp học phần (Yêu cầu Token) |

### Đăng ký học phần
| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|-------|
| POST | /api/enrollments | Đăng ký vào một lớp học phần (Yêu cầu Token) |
| PUT | /api/enrollments/:id/cancel | Hủy đăng ký học phần (Yêu cầu Token) |
| GET | /api/enrollments/my | Danh sách học phần đã đăng ký (Yêu cầu Token) |

## Quy tắc nghiệp vụ

### Quy tắc đăng ký (BR01-BR06)
- BR01: Không cho phép đăng ký trùng lớp học phần (ràng buộc UNIQUE trong DB).
- BR02: Không thể đăng ký khi lớp học phần đã đủ sĩ số.
- BR03: Chỉ được phép đăng ký trong khung thời gian quy định của học kỳ.
- BR04: Hệ thống tự động kiểm tra và ngăn chặn trùng lịch học.
- BR05: Sinh viên có trạng thái bị đình chỉ (suspended) không được phép đăng ký.
- BR06: Không thể đăng ký vào các lớp học phần đã bị hủy hoặc đã đóng.

### Quy tắc hủy đăng ký (BR07-BR09)
- BR07: Chỉ được phép hủy đăng ký trong khung thời gian quy định.
- BR08: Số lượng sinh viên hiện tại của lớp sẽ tự động giảm khi có sinh viên hủy thành công.
- BR09: Dữ liệu đăng ký được lưu vết (soft delete), trạng thái chuyển sang 'cancelled'.

## Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user_id",
  "role": "student|admin",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Header Requirements
Tất cả authenticated requests cần header:
```
Authorization: Bearer <jwt_token>
```

### Role-based Permissions
- **Student:** Chỉ truy cập dữ liệu cá nhân, đăng ký học phần, xem công khai
- **Admin:** Quản lý toàn bộ hệ thống (môn học, học kỳ, lớp, kết quả)

## Error Handling

Tất cả API trả về consistent error format:

### Success Response (200)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "statusCode": 400
}
```

### Common HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or request format
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Business rule violation (e.g., duplicate enrollment)
- `500 Internal Server Error` - Server error

## Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=course_management
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## Development Commands

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed initial data
npm run seed

# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Run linter
npm run lint
```

## API Response Examples

### Successful Login
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "21IT001",
      "email": "student@example.com",
      "role": "student",
      "full_name": "Nguyễn Văn A"
    }
  }
}
```

### Failed Enrollment (Schedule Conflict)
```json
{
  "success": false,
  "message": "Schedule conflict with another enrolled course",
  "errorCode": "SCHEDULE_CONFLICT",
  "statusCode": 409
}
```

## Performance Considerations

- Tất cả API endpoints có pagination support (limit, offset)
- Database queries được optimize với proper indexes
- Caching enabled cho danh sách môn học, học kỳ
- Connection pooling: default pool size = 5

## Deployment Checklist

- [ ] Cấu hình `.env` với production values
- [ ] Tạo database và chạy migrations
- [ ] Kích hoạt SSL/TLS
- [ ] Cấu hình CORS cho frontend domain
- [ ] Setup PM2 hoặc Docker container
- [ ] Cấu hình log rotation
- [ ] Backup database hàng ngày
- [ ] Monitor error logs và performance
