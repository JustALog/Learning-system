#!/bin/bash

# ============================================
# Course Management System - Docker Helper Script
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${YELLOW}[INFO] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[OK] $1${NC}"
}

# Show help
show_help() {
    print_header "Docker Helper Commands"
    cat << EOF

Usage: ./docker-helper.sh <command>

Commands:
  up                 - Start all services
  down               - Stop all services
  build              - Build Docker images
  logs               - Show logs (all services)
  logs-backend       - Show backend logs only
  logs-frontend      - Show frontend logs only
  logs-db            - Show database logs only
  status             - Show containers status
  restart            - Restart all services
  restart-backend    - Restart backend only
  restart-frontend   - Restart frontend only
  restart-db         - Restart database only
  shell-backend      - Open shell in backend container
  shell-db           - Open MySQL shell
  backup-db          - Backup database to SQL file
  restore-db <file>  - Restore database from SQL file
  clean              - Remove containers and volumes
  help               - Show this help message

Examples:
  ./docker-helper.sh up
  ./docker-helper.sh logs-backend
  ./docker-helper.sh backup-db
  ./docker-helper.sh restore-db backup.sql

EOF
}

# Commands
case "${1:-}" in
    up)
        print_header "Starting services..."
        docker-compose up -d
        print_success "Services started!"
        echo ""
        print_info "Frontend: http://localhost"
        print_info "Backend API: http://localhost:3000/api"
        print_info "Database: localhost:3306"
        ;;

    down)
        print_header "Stopping services..."
        docker-compose down
        print_success "Services stopped!"
        ;;

    build)
        print_header "Building images..."
        docker-compose build
        print_success "Build complete!"
        ;;

    logs)
        print_header "Showing logs (all services)"
        docker-compose logs -f
        ;;

    logs-backend)
        print_header "Showing backend logs"
        docker-compose logs -f backend
        ;;

    logs-frontend)
        print_header "Showing frontend logs"
        docker-compose logs -f frontend
        ;;

    logs-db)
        print_header "Showing database logs"
        docker-compose logs -f db
        ;;

    status)
        print_header "Container Status"
        docker-compose ps
        ;;

    restart)
        print_header "Restarting all services..."
        docker-compose restart
        print_success "Services restarted!"
        ;;

    restart-backend)
        print_header "Restarting backend..."
        docker-compose restart backend
        print_success "Backend restarted!"
        ;;

    restart-frontend)
        print_header "Restarting frontend..."
        docker-compose restart frontend
        print_success "Frontend restarted!"
        ;;

    restart-db)
        print_header "Restarting database..."
        docker-compose restart db
        print_success "Database restarted!"
        ;;

    shell-backend)
        print_header "Opening backend shell..."
        docker-compose exec backend sh
        ;;

    shell-db)
        print_header "Opening MySQL shell..."
        docker-compose exec db mysql -u root -p
        ;;

    backup-db)
        BACKUP_FILE="backup-$(date +%Y%m%d_%H%M%S).sql"
        print_header "Backing up database to $BACKUP_FILE..."
        docker-compose exec db mysqldump -u root -proot course_management > "$BACKUP_FILE"
        print_success "Database backed up to $BACKUP_FILE!"
        ;;

    restore-db)
        if [ -z "$2" ]; then
            print_error "Please provide backup file path"
            echo "Usage: ./docker-helper.sh restore-db <file>"
            exit 1
        fi
        print_header "Restoring database from $2..."
        docker-compose exec -T db mysql -u root -proot course_management < "$2"
        print_success "Database restored!"
        ;;

    clean)
        print_header "Removing containers and volumes..."
        read -p "Are you sure? This will delete all data! (y/N) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            print_success "Cleaned!"
        else
            print_info "Cancelled"
        fi
        ;;

    help|--help|-h)
        show_help
        ;;

    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
