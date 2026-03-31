.PHONY: help up down build logs restart clean

# Colors
YELLOW := \033[0;33m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help:
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(YELLOW)Course Management System - Makefile$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo ""
	@echo "$(YELLOW)Services:$(NC)"
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make build           - Build Docker images"
	@echo "  make rebuild         - Rebuild without cache"
	@echo "  make restart         - Restart all services"
	@echo ""
	@echo "$(YELLOW)Logs:$(NC)"
	@echo "  make logs            - Show all logs"
	@echo "  make logs-backend    - Show backend logs"
	@echo "  make logs-frontend   - Show frontend logs"
	@echo "  make logs-db         - Show database logs"
	@echo ""
	@echo "$(YELLOW)Database:$(NC)"
	@echo "  make backup          - Backup database"
	@echo "  make shell-db        - Open MySQL shell"
	@echo "  make shell-backend   - Open backend shell"
	@echo ""
	@echo "$(YELLOW)Maintenance:$(NC)"
	@echo "  make status          - Show container status"
	@echo "  make clean           - Remove containers & volumes"
	@echo "  make ps              - Show running containers"
	@echo ""

# Services
up:
	@echo "$(GREEN)Starting services...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)[OK] Services started!$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC) http://localhost"
	@echo "$(YELLOW)Backend API:$(NC) http://localhost:3000/api"
	@echo "$(YELLOW)Database:$(NC) localhost:3306"

down:
	@echo "$(GREEN)Stopping services...$(NC)"
	@docker-compose down
	@echo "$(GREEN)[OK] Services stopped!$(NC)"

build:
	@echo "$(GREEN)Building images...$(NC)"
	@docker-compose build
	@echo "$(GREEN)[OK] Build complete!$(NC)"

rebuild:
	@echo "$(GREEN)Rebuilding images without cache...$(NC)"
	@docker-compose build --no-cache
	@echo "$(GREEN)[OK] Rebuild complete!$(NC)"

restart:
	@echo "$(GREEN)Restarting services...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)[OK] Services restarted!$(NC)"

# Logs
logs:
	@docker-compose logs -f

logs-backend:
	@docker-compose logs -f backend

logs-frontend:
	@docker-compose logs -f frontend

logs-db:
	@docker-compose logs -f db

# Database
backup:
	@echo "$(GREEN)Backing up database...$(NC)"
	@docker-compose exec db mysqldump -u root -proot course_management > backup-$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)[OK] Backup complete!$(NC)"

shell-db:
	@docker-compose exec db mysql -u root -p

shell-backend:
	@docker-compose exec backend sh

# Status
status:
	@echo "$(GREEN)Container Status:$(NC)"
	@docker-compose ps

ps:
	@docker ps

# Maintenance
clean:
	@echo "$(RED)Removing containers and volumes...$(NC)"
	@echo "$(RED)[WARNING] This will delete all data!$(NC)"
	@docker-compose down -v
	@echo "$(GREEN)[OK] Cleaned!$(NC)"

# Development setup
dev-setup:
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@cp .env.development .env || echo "$(YELLOW).env already exists$(NC)"
	@make build
	@make up
	@echo "$(GREEN)[OK] Development environment ready!$(NC)"

# Production setup
prod-setup:
	@echo "$(RED)Setting up production environment...$(NC)"
	@cp .env.production .env || echo "$(YELLOW).env already exists$(NC)"
	@echo "$(RED)[WARNING] Please edit .env with production values!$(NC)"
	@make build
	@echo "$(GREEN)Run 'make up' to start services$(NC)"

# Quick commands
start: up
stop: down
restart-backend:
	@docker-compose restart backend
restart-frontend:
	@docker-compose restart frontend
restart-db:
	@docker-compose restart db
