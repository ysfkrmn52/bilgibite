#!/bin/bash
# Production Server Setup Script for BilgiBite

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root"
fi

log "Setting up production server for BilgiBite..."

# Update system
log "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential packages
log "Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    nginx \
    certbot \
    python3-certbot-nginx

# Install Node.js 18
log "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Docker
log "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
log "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install AWS CLI
log "Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf awscliv2.zip aws/

# Create application user
log "Creating application user..."
useradd -m -s /bin/bash bilgibite
usermod -aG docker bilgibite

# Create application directories
log "Creating application directories..."
mkdir -p /opt/bilgibite
mkdir -p /opt/backups
mkdir -p /var/log/bilgibite
mkdir -p /etc/nginx/ssl
chown -R bilgibite:bilgibite /opt/bilgibite
chown -R bilgibite:bilgibite /opt/backups
chown -R bilgibite:bilgibite /var/log/bilgibite

# Configure UFW firewall
log "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
log "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Configure swap (if not exists)
if ! swapon --show | grep -q swap; then
    log "Creating swap file..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
fi

# Set up log rotation
log "Setting up log rotation..."
cat > /etc/logrotate.d/bilgibite << 'EOF'
/var/log/bilgibite/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}

/opt/bilgibite/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su bilgibite bilgibite
}
EOF

# Create systemd service for monitoring
log "Creating monitoring service..."
cat > /etc/systemd/system/bilgibite-monitor.service << 'EOF'
[Unit]
Description=BilgiBite Health Monitor
After=network.target

[Service]
Type=simple
User=bilgibite
Group=bilgibite
WorkingDirectory=/opt/bilgibite
ExecStart=/opt/bilgibite/scripts/health-monitor.sh
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# Create health monitor script
log "Creating health monitor script..."
cat > /opt/bilgibite/scripts/health-monitor.sh << 'EOF'
#!/bin/bash
# Health monitoring script

HEALTH_URL="http://localhost/health"
LOG_FILE="/var/log/bilgibite/health-monitor.log"
ALERT_EMAIL="admin@bilgibite.com"

while true; do
    if ! curl -f "$HEALTH_URL" &> /dev/null; then
        echo "$(date): Health check failed" >> "$LOG_FILE"
        
        # Send alert email
        echo "BilgiBite health check failed at $(date)" | \
            mail -s "ALERT: BilgiBite Health Check Failed" "$ALERT_EMAIL" || true
        
        # Attempt to restart the application
        cd /opt/bilgibite
        docker-compose -f deployment/docker-compose.prod.yml restart app
        
        sleep 60
    else
        echo "$(date): Health check passed" >> "$LOG_FILE"
        sleep 30
    fi
done
EOF

chmod +x /opt/bilgibite/scripts/health-monitor.sh
chown bilgibite:bilgibite /opt/bilgibite/scripts/health-monitor.sh

# Set up SSL certificate
setup_ssl() {
    local domain="bilgibite.com"
    local email="admin@bilgibite.com"
    
    log "Setting up SSL certificate for $domain..."
    
    # Create temporary nginx config
    cat > /etc/nginx/sites-available/bilgibite << EOF
server {
    listen 80;
    server_name $domain www.$domain;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/bilgibite /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    systemctl reload nginx
    
    # Get SSL certificate
    certbot --nginx -d "$domain" -d "www.$domain" --email "$email" --agree-tos --no-eff-email --non-interactive
    
    # Set up auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
}

# Configure system limits
log "Configuring system limits..."
cat >> /etc/security/limits.conf << 'EOF'
bilgibite soft nofile 65536
bilgibite hard nofile 65536
bilgibite soft nproc 4096
bilgibite hard nproc 4096
EOF

# Optimize kernel parameters
log "Optimizing kernel parameters..."
cat >> /etc/sysctl.conf << 'EOF'
# Network optimizations
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30

# Memory optimizations
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# File system optimizations
fs.file-max = 2097152
EOF

sysctl -p

# Create backup script
log "Creating backup script..."
cat > /opt/bilgibite/scripts/backup.sh << 'EOF'
#!/bin/bash
# Automated backup script

BACKUP_DIR="/opt/backups"
RETENTION_DAYS=30
S3_BUCKET="bilgibite-backups"

# Create timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="bilgibite_$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

mkdir -p "$BACKUP_PATH"

# Database backup
docker exec bilgibite_postgres_1 pg_dump -U postgres bilgibite | gzip > "$BACKUP_PATH/database.sql.gz"

# Application files backup
tar -czf "$BACKUP_PATH/app_files.tar.gz" -C /opt/bilgibite .

# Upload to S3
aws s3 sync "$BACKUP_PATH" "s3://$S3_BUCKET/$BACKUP_NAME/"

# Clean old backups
find "$BACKUP_DIR" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

echo "Backup completed: $BACKUP_NAME"
EOF

chmod +x /opt/bilgibite/scripts/backup.sh
chown bilgibite:bilgibite /opt/bilgibite/scripts/backup.sh

# Set up daily backups
echo "0 2 * * * /opt/bilgibite/scripts/backup.sh" | crontab -u bilgibite -

# Install monitoring tools
log "Installing monitoring tools..."
apt-get install -y prometheus-node-exporter

# Create deployment completion marker
touch /opt/bilgibite/.server-setup-complete

log "Production server setup completed successfully!"
log "Next steps:"
log "1. Copy your application code to /opt/bilgibite"
log "2. Configure environment variables in /opt/bilgibite/.env"
log "3. Run the deployment script: ./scripts/deploy.sh"
log "4. Set up SSL certificates: sudo certbot --nginx -d bilgibite.com"
log ""
log "Important notes:"
log "- Application user: bilgibite"
log "- Application directory: /opt/bilgibite"
log "- Backup directory: /opt/backups"
log "- Log directory: /var/log/bilgibite"
log ""
log "The server is now ready for BilgiBite deployment!"