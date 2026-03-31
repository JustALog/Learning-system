# Quick Start Docker

Để nhanh chóng khởi chạy toàn bộ hệ thống bằng Docker:

## 1 Minute Quick Start

```bash
# Bước 1: Clone project (nếu chưa có)
git clone <your-repo-url>
cd course-management-system

# Bước 2: Setup environment
cp .env.development .env

# Bước 3: Build & Start
docker-compose build
docker-compose up -d

# Bước 4: Kiểm tra
docker-compose ps
```

## Access the System

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost | 80 |
| Backend API | http://localhost:3000/api | 3000 |
| Database | localhost | 3306 |

## Stop All Services

```bash
docker-compose down
```

---

Chi tiết đầy đủ xem tại: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
