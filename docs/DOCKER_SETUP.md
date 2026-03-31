# Docker Setup - Summary

Hệ thống đã được cấu hình hoàn toàn để deploy bằng Docker. Dưới đây là các file và tài liệu được thêm vào.

---

## Files Created/Updated

### Docker Configuration Files

| File | Mục Đích |
|------|---------|
| `server/Dockerfile` | Build image cho Backend (Node.js) |
| `server/.dockerignore` | Files bỏ qua khi build backend image |
| `client/Dockerfile` | Build image cho Frontend (React + Vite + Nginx) |
| `client/.dockerignore` | Files bỏ qua khi build frontend image |
| `client/nginx.conf` | Cấu hình Nginx để serve React app |
| `docker-compose.yml` | Orchestration file cho 3 services |
| `.env.docker` | Environment file cho Docker (reference) |
| `.env.development` | Environment file cho development |
| `.env.production` | Environment file cho production |
| `Makefile` | Quick commands để manage Docker |
| `docker-helper.sh` | Bash script helper để manage containers |

### Documentation

| File | Mục Đích |
|------|---------|
| `docs/DOCKER_DEPLOYMENT.md` | Hướng dẫn deploy chi tiết (20+ pages) |
| `docs/DOCKER_QUICKSTART.md` | Quick start guide (1 phút khởi chạy) |

---

## Quick Start

### Option 1: Dùng Make Commands (Đơn Giản Nhất)

```bash
# Setup development
make dev-setup

# Hoặc step by step
make build
make up
make status

# View logs
make logs-backend

# Stop
make down
```

### Option 2: Dùng Docker Compose Trực Tiếp

```bash
# Setup environment
cp .env.development .env

# Build & Start
docker-compose build
docker-compose up -d

# View status
docker-compose ps
```

### Option 3: Dùng Helper Script

```bash
# Setup
chmod +x docker-helper.sh
./docker-helper.sh build
./docker-helper.sh up

# Logs
./docker-helper.sh logs-backend

# Stop
./docker-helper.sh down
```

---

## Docker Architecture

```
┌─────────────────────────────────────────┐
│   Frontend Container (Nginx)            │
│   - Port: 80                            │
│   - React build được serve bởi Nginx    │
│   - Health check: /health               │
└─────────┬───────────────────────────────┘
          │ API calls (http://backend:3000)
          ▼
┌─────────────────────────────────────────┐
│   Backend Container (Node.js)           │
│   - Port: 3000                          │
│   - Express API server                  │
│   - Volume mount: src/ (dev mode)       │
│   - Health check: /api/health           │
└─────────┬───────────────────────────────┘
          │ Query (tcp://db:3306)
          ▼
┌─────────────────────────────────────────┐
│   Database Container (MySQL)            │
│   - Port: 3306                          │
│   - Persistent volume: db_data          │
│   - Health check: mysqladmin ping       │
└─────────────────────────────────────────┘

All containers connected via: app-network
```

---

## Make Commands Reference

```bash
# Khởi động & Quản lý
make up                   # Khởi động tất cả services
make down                 # Dừng tất cả services
make build                # Build images
make rebuild              # Build lại (chậm hơn, không cache)
make restart              # Restart tất cả
make status               # Xem status containers

# Logs
make logs                 # Logs tất cả
make logs-backend         # Logs backend only
make logs-frontend        # Logs frontend only
make logs-db              # Logs database only

# Database
make backup               # Backup database
make shell-db             # Open MySQL shell
make shell-backend        # Open backend shell

# Maintenance
make clean                # Remove containers & volumes (WARNING: Removes data!)
make dev-setup            # Quick setup cho development
make prod-setup           # Quick setup cho production
```

---

## Docker Helper Script Commands

```bash
# Khởi động & Quản lý
./docker-helper.sh up
./docker-helper.sh down
./docker-helper.sh build
./docker-helper.sh restart

# Logs
./docker-helper.sh logs
./docker-helper.sh logs-backend
./docker-helper.sh logs-db

# Shell Access
./docker-helper.sh shell-backend
./docker-helper.sh shell-db

# Database
./docker-helper.sh backup-db
./docker-helper.sh restore-db backup-20260331_120000.sql

# Status
./docker-helper.sh status
```

---

## Access Services

Sau khi `docker-compose up -d`:

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| Frontend | http://localhost | - | - |
| Backend API | http://localhost:3000/api | - | - |
| Database (MySQL) | localhost:3306 | root | root |
| Health Check (API) | http://localhost:3000/api/health | - | - |

---

## Environment Configuration

### Development (.env.development)
```bash
DB_HOST=db
DB_USER=root
DB_PASS=root
NODE_ENV=development
JWT_SECRET=dev_secret_only
```

### Production (.env.production)
```bash
DB_HOST=db
DB_USER=course_user         # Not root!
DB_PASS=strong_password     # Strong password!
NODE_ENV=production
JWT_SECRET=strong_random_key  # Min 32 chars
VITE_API_URL=https://api.yourdomain.com/api
```

---

## Security Best Practices

1. **Never commit sensitive files**
   ```
   # .gitignore includes:
   .env
   .env.production
   .env.development
   ```

2. **Use strong secrets in production**
   ```bash
   # Generate strong JWT secret
   openssl rand -base64 32
   ```

3. **Change database credentials**
   - Development: okayใช้Root
   - Production: Create dedicated user

4. **Use HTTPS in production**
   - Setup Nginx reverse proxy
   - Use Let's Encrypt for SSL

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Change ports in .env
BACKEND_PORT=3001
FRONTEND_PORT=8080

# Rebuild and restart
docker-compose down
docker-compose up -d
```

### Database Connection Failed
```bash
# Check if DB is healthy
docker-compose ps

# If unhealthy, restart
docker-compose restart db

# View logs
docker-compose logs db
```

### Frontend Can't Connect to Backend
- Check Backend API URL in `.env`
- Ensure backend container is running
- Check network connectivity
- Look at browser console for CORS errors

### Rebuild Without Cache
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## Detailed Documentation

For comprehensive guides:

- **Full Deployment Guide**: See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **Quick Start (1 min)**: See [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md)
- **Docker Compose Reference**: [docs/docker-compose.yml](../docker-compose.yml)

---

## Features

[OK] Multi-stage builds để giảm image size  
[OK] Health checks cho tất cả services  
[OK] Volume mounts cho development  
[OK] Environment variable management  
[OK] Persistent database storage  
[OK] Network isolation  
[OK] Security best practices  
[OK] easy-to-use helper scripts  
[OK] Production-ready configuration  
[OK] Nginx reverse proxy setup  

---

## Next Steps

1. **Setup Development**
   ```bash
   make dev-setup
   ```

2. **Access Frontend**
   - Open http://localhost in browser

3. **Test Backend**
   ```bash
   curl http://localhost:3000/api/health
   ```

4. **View Logs**
   ```bash
   make logs-backend
   ```

5. **Read Full Guide**
   - [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for detailed information

---

**Status**: [OK] Ready to Deploy  
**Version**: 1.0.0  
**Last Updated**: 2026-03-31
