#!/bin/bash
# BilgiBite Production Deployment Script

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="bilgibite"
DEPLOYMENT_DIR="/opt/bilgibite"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/deployment.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        error "Do not run this script as root"
    fi
    
    # Check required commands
    commands=("docker" "docker-compose" "git" "curl" "aws")
    for cmd in "${commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "$cmd is not installed"
        fi
    done
    
    # Check environment file
    if [[ ! -f ".env" ]]; then
        error ".env file not found. Copy .env.example and configure it."
    fi
    
    log "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    
    # Database backup
    docker-compose exec -T postgres pg_dump -U postgres bilgibite > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
    
    # Application files backup
    if [[ -d "$DEPLOYMENT_DIR" ]]; then
        tar -czf "$BACKUP_DIR/$BACKUP_NAME/app_files.tar.gz" -C "$DEPLOYMENT_DIR" .
    fi
    
    # Upload to S3
    if [[ -n "$AWS_S3_BUCKET" ]]; then
        aws s3 sync "$BACKUP_DIR/$BACKUP_NAME" "s3://$AWS_S3_BUCKET/backups/$BACKUP_NAME/"
        log "Backup uploaded to S3"
    fi
    
    log "Backup created: $BACKUP_NAME"
}

# Build and deploy
deploy_application() {
    log "Starting deployment..."
    
    # Pull latest code
    git pull origin main
    
    # Build application
    log "Building application..."
    docker-compose -f deployment/docker-compose.prod.yml build --no-cache
    
    # Stop current services
    log "Stopping current services..."
    docker-compose -f deployment/docker-compose.prod.yml down
    
    # Start new services
    log "Starting new services..."
    docker-compose -f deployment/docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose -f deployment/docker-compose.prod.yml exec -T app npm run db:push
    
    log "Deployment completed successfully"
}

# Health checks
perform_health_checks() {
    log "Performing health checks..."
    
    # Wait for application to start
    sleep 10
    
    # Check application health
    for i in {1..10}; do
        if curl -f http://localhost/health &> /dev/null; then
            log "Application health check passed"
            break
        fi
        
        if [[ $i -eq 10 ]]; then
            error "Application health check failed after 10 attempts"
        fi
        
        warn "Health check attempt $i failed, retrying in 5 seconds..."
        sleep 5
    done
    
    # Check database connectivity
    if docker-compose -f deployment/docker-compose.prod.yml exec -T postgres pg_isready -U postgres; then
        log "Database connectivity check passed"
    else
        error "Database connectivity check failed"
    fi
    
    # Check Redis connectivity
    if docker-compose -f deployment/docker-compose.prod.yml exec -T redis redis-cli ping | grep -q PONG; then
        log "Redis connectivity check passed"
    else
        error "Redis connectivity check failed"
    fi
    
    log "All health checks passed"
}

# SSL certificate renewal
renew_ssl_certificates() {
    log "Checking SSL certificates..."
    
    # Check certificate expiration
    cert_file="/etc/nginx/ssl/bilgibite.com.crt"
    if [[ -f "$cert_file" ]]; then
        expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [[ $days_until_expiry -lt 30 ]]; then
            warn "SSL certificate expires in $days_until_expiry days"
            # Here you would add your SSL renewal logic (certbot, etc.)
        else
            log "SSL certificate is valid for $days_until_expiry more days"
        fi
    fi
}

# Clean up old Docker images and containers
cleanup_docker() {
    log "Cleaning up Docker resources..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused networks
    docker network prune -f
    
    # Remove unused volumes (be careful with this)
    # docker volume prune -f
    
    log "Docker cleanup completed"
}

# Send notifications
send_notifications() {
    log "Sending deployment notifications..."
    
    # Slack notification (if webhook URL is configured)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚀 BilgiBite deployment completed successfully!"}' \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Email notification (if configured)
    if [[ -n "$NOTIFICATION_EMAIL" ]]; then
        echo "BilgiBite deployment completed at $(date)" | \
            mail -s "Deployment Success - BilgiBite" "$NOTIFICATION_EMAIL"
    fi
    
    log "Notifications sent"
}

# Main deployment process
main() {
    log "Starting BilgiBite deployment process..."
    
    check_prerequisites
    create_backup
    deploy_application
    perform_health_checks
    renew_ssl_certificates
    cleanup_docker
    send_notifications
    
    log "🎉 Deployment completed successfully!"
    log "Application is available at: https://bilgibite.com"
}

# Rollback function
rollback() {
    log "Starting rollback process..."
    
    # Get latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n1)
    
    if [[ -z "$LATEST_BACKUP" ]]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to: $LATEST_BACKUP"
    
    # Stop current services
    docker-compose -f deployment/docker-compose.prod.yml down
    
    # Restore database
    docker-compose -f deployment/docker-compose.prod.yml up -d postgres
    sleep 10
    docker-compose -f deployment/docker-compose.prod.yml exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS bilgibite;"
    docker-compose -f deployment/docker-compose.prod.yml exec -T postgres psql -U postgres -c "CREATE DATABASE bilgibite;"
    docker-compose -f deployment/docker-compose.prod.yml exec -T postgres psql -U postgres -d bilgibite < "$BACKUP_DIR/$LATEST_BACKUP/database.sql"
    
    # Restore application files
    if [[ -f "$BACKUP_DIR/$LATEST_BACKUP/app_files.tar.gz" ]]; then
        tar -xzf "$BACKUP_DIR/$LATEST_BACKUP/app_files.tar.gz" -C "$DEPLOYMENT_DIR"
    fi
    
    # Start services
    docker-compose -f deployment/docker-compose.prod.yml up -d
    
    perform_health_checks
    
    log "Rollback completed successfully"
}

# Command line arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    backup)
        create_backup
        ;;
    health)
        perform_health_checks
        ;;
    cleanup)
        cleanup_docker
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|backup|health|cleanup}"
        exit 1
        ;;
esac