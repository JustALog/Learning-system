# Web Quản lý và Đăng ký Học phần - Full Stack Monorepo

Hệ thống quản lý và đăng ký học phần dành cho sinh viên, bao gồm Backend API (Node.js/Express) và Frontend (Next.js/React).

## Cấu trúc dự án (Monorepo)

```
/
├── client/                 # Frontend Next.js (Tailwind CSS, Shadcn UI)
├── server/                 # Backend API (Express.js, Sequelize, MySQL)
├── package.json            # Cấu hình npm workspaces
└── README.md
```

## Công nghệ sử dụng

### Frontend (Client)
- Framework: Next.js 16 (App Router)
- UI Library: Shadcn UI & Tailwind CSS
- Icons: Lucide React

### Backend (Server)
- Runtime: Node.js
- Framework: Express.js
- ORM: Sequelize 6
- Database: MySQL 8.0+

## Hướng dẫn bắt đầu

### 1. Cài đặt toàn bộ dependencies
Từ thư mục gốc, chạy:
```bash
npm install
```

### 2. Cấu hình môi trường
Vào thư mục `server/` và cấu hình file `.env`:
```bash
cd server
cp .env.example .env
# Chỉnh sửa file .env với thông tin kết nối MySQL của bạn
```

### 3. Khởi động Cơ sở dữ liệu (Dùng Docker - Khuyên dùng)
Nếu bạn đã cài đặt Docker, bạn có thể khởi động MySQL nhanh chóng:
```bash
docker-compose up -d db
```
Hệ thống sẽ tự động tạo cơ sở dữ liệu `learning_system` và khởi tạo các bảng từ file `server/migrations/init.sql`.

### 4. Khởi động ứng dụng (Cả Client và Server)
Từ thư mục gốc, chạy:
```bash
npm run dev
```
- Frontend sẽ chạy tại: [http://localhost:3000](http://localhost:3000)
- Backend API sẽ chạy tại: [http://localhost:5000](http://localhost:5000) (hoặc cổng cấu hình trong .env)

## Các lệnh hữu ích khác

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy cả client và server song song |
| `npm run migrate` | Chạy migration cơ sở dữ liệu (Backend) |
| `npm run seed` | Nạp dữ liệu mẫu (Backend) |
| `npm run test:server` | Chạy bộ kiểm thử cho backend |

---
© 2026 Hệ thống Đăng ký Học phần
