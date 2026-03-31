# Docker Deployment Guide

Hướng dẫn chi tiết để deploy hệ thống Quản Lý và Đăng Ký Học Phần sử dụng Docker.

---

## Requirements

Trước khi bắt đầu, hãy chắc chắn bạn đã cài đặt:

- **Docker**: [Cài đặt Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Cài đặt Docker Compose](https://docs.docker.com/compose/install/)

### Kiểm tra cài đặt

```bash
docker --version
docker-compose --version
```

---

## Docker Architecture

Hệ thống gồm 3 services chính:

```
┌─────────────────────────────────────────┐
│   Frontend (Nginx + React Build)        │
│   Port: 80 (có thể đổi)                 │
└─────────────────────────────────────────┘
           ↓ API Calls
┌─────────────────────────────────────────┐
│   Backend (Node.js + Express)           │
│   Port: 3000                            │
└─────────────────────────────────────────┘
           ↓ Database Operations
┌─────────────────────────────────────────┐
│   MySQL Database                        │
│   Port: 3306                            │
└─────────────────────────────────────────┘
```

Tất cả services kết nối qua `app-network`.

---

## File Structure

```
project-root/
├── docker-compose.yml          # Orchetration file
├── .env.docker                 # Environment cho Docker
├── .env.development            # Environment cho development
├── .env.production             # Environment cho production
│
├── server/
│   ├── Dockerfile              # Build backend image
│   ├── .dockerignore          # Files to ignore
│   └── ...
│
└── client/
    ├── Dockerfile             # Build frontend image
    ├── nginx.conf             # Nginx configuration
    ├── .dockerignore          # Files to ignore
    └── ...
```

---

## Deployment Guide

### 1. Chuẩn Bị Environment

Sao chép file environment phù hợp với môi trường của bạn:

#### Development
```bash
cp .env.development .env
```

#### Production
```bash
cp .env.production .env
# Sửa các thông tin nhạy cảm trong file .env
```

Chỉnh sửa file `.env` với thông tin thích hợp:

```bash
# Sửa JWT_SECRET, database credentials, API URLs, ...
nano .env
```

### 2. Xây Dựng Images

#### Build tất cả images
```bash
docker-compose build
```

#### Build riêng service
```bash
docker-compose build backend    # Build backend image
docker-compose build frontend   # Build frontend image
docker-compose build db         # Pull MySQL image
```

### 3. Khởi Động Services

#### Development (có tính năng auto-reload)
```bash
docker-compose up -d
```

Output mong đợi:
```
Creating course-management-db       ... done
Creating course-management-backend  ... done
Creating course-management-frontend ... done
```

#### Production (Nên dùng daemon mode)
```bash
docker-compose up -d --no-build
```

### 4. Kiểm Tra Services

#### Xem trạng thái các containers
```bash
docker-compose ps
```

```
NAME                           COMMAND              STATUS           PORTS
course-management-db           docker-entrypoint.sh Healthy (42s)    0.0.0.0:3306->3306/tcp
course-management-backend      dumb-init -- node... Up (healthy)     0.0.0.0:3000->3000/tcp
course-management-frontend     nginx -g daemon off  Up (healthy)     0.0.0.0:80->80/tcp
```

#### Xem logs
```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 5. Kiểm Tra Kết Nối

#### Health checks tự động
Mỗi service có health check riêng:

- **Database**: Kiểm tra MySQL ping
- **Backend**: Kiểm tra `/api/health`
- **Frontend**: Kiểm tra `/health`

```bash
# Xem chi tiết health status
docker-compose ps
```

#### Test Backend API
```bash
# Health check
curl http://localhost:3000/api/health

# Expected response:
# {"success":true,"message":"API is running","timestamp":"2026-03-31T..."}
```

#### Truy cập Frontend
Mở trình duyệt: **`http://localhost`**

---

## Container Management

### Dừng Services
```bash
docker-compose stop
```

### Khởi Động Lại Services
```bash
docker-compose restart
```

```bash
# Restart service cụ thể
docker-compose restart backend
```

### Xóa Containers
```bash
# Xóa containers nhưng giữ data
docker-compose down

# Xóa tất cả, bao gồm volumes (HỎI: Dữ liệu sẽ bị xóa!)
docker-compose down -v
```

### Xem Log Chi Tiết
```bash
# 50 dòng log cuối cùng
docker-compose logs -f --tail=50 backend

# Xem log theo timestamp
docker-compose logs --since 2026-03-31T10:00:00 backend
```

### Container không khởi động
```bash
# Xem log lỗi
docker-compose logs backend

# Xóa và build lại
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### Lỗi kết nối Database
```bash
# Kiểm tra status database
docker-compose ps db

# Xem log database
docker-compose logs db

# Nếu container báo "unhealthy", thử
docker-compose restart db
```

### Lỗi port đã hết
```bash
# Kiểm tra port nào đang chạy
netstat -tlnp | grep :3000
netstat -tlnp | grep :80
netstat -tlnp | grep :3306

# Thay đổi port trong .env hoặc docker-compose.yml
# Ví dụ: BACKEND_PORT=3001
docker-compose up -d
```

### Reset toàn bộ dữ liệu
```bash
# WARNING: This command will delete all data!
docker-compose down -v
docker volume prune
docker-compose up -d
```

---

## Monitoring Containers

### Xem tài nguyên sử dụng
```bash
docker stats
```

```
CONTAINER ID   NAME                              CPU %   MEM USAGE / LIMIT
3f2k9d8s2s0p   course-management-frontend      0.01%   15.23MiB / 4GiB
8d9k2s3a4f5g   course-management-backend       0.05%   78.45MiB / 4GiB
2k3l4m5n6o7p   course-management-db            0.12%   95.32MiB / 4GiB
```

### Kiểm tra dung lượng image
```bash
docker images | grep course-management
```

---

## Security Best Practices

### Development
```bash
# File: .env.development
JWT_SECRET=dev_secret_only_for_testing
DB_USER=root
DB_PASS=root
```

### Production
```bash
# File: .env.production (NEVER commit to git)
JWT_SECRET=generate_strong_random_string_here_min_32_chars
DB_USER=course_user_not_root
DB_PASS=strong_database_password_here
```

### Cài đặt .gitignore
```bash
# Thêm vào .gitignore
.env
.env.production
.env.development

# Không bao giờ commit files này!
```

---

## Scaling & Performance

### Tăng giới hạn tài nguyên

Chỉnh sửa `docker-compose.yml`:

```yaml
services:
  backend:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Multiple Backend Instances

```yaml
services:
  backend-1:
    # backend service 1
    ports:
      - "3001:3000"
      
  backend-2:
    # backend service 2
    ports:
      - "3002:3000"
```

Sau đó dùng **nginx** hoặc **HAProxy** để load balance.

---

## Development Workflow

### Chỉnh sửa code backend (Development)

Với volume mount trong docker-compose, code thay đổi sẽ tự động reload:

```bash
# Chỉnh sửa file
nano server/src/app.js

# Container sẽ tự động detect thay đổi (qua nodemon)
# Xem log:
docker-compose logs -f backend
```

### Chỉnh sửa code frontend (Development)

Frontend được build một lần, sau đó phục vụ bằng Nginx:

```bash
# Để thay đổi frontend, rebuild image
docker-compose stop frontend
docker-compose build frontend
docker-compose up -d frontend
```

---

## Production Server Deployment

### 1. SSH vào Server
```bash
ssh user@your-server.com
```

### 2. Clone Project
```bash
git clone https://github.com/yourrepo/course-management-system.git
cd course-management-system
```

### 3. Setup Production Environment
```bash
cp .env.production .env

# Chỉnh sửa các biến sensitive
nano .env

# Ví dụ:
# JWT_SECRET=abc123...
# DB_PASS=strongpassword...
# VITE_API_URL=https://api.yourdomain.com/api
```

### 4. Build & Deploy
```bash
docker-compose build
docker-compose up -d
```

### 5. Kiểm Tra Status
```bash
docker-compose ps
docker-compose logs
```

### 6. Setup Domain (Nginx Reverse Proxy)
Tạo file `/etc/nginx/sites-available/yourdomain.com`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)


**Version**: 1.0.0  
**Last Updated**: 2026-03-31
