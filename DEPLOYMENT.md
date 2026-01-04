# EC2 Deployment Guide

This guide will help you deploy the MakeMemes application on an AWS EC2 instance using Docker and Docker Compose.

## Prerequisites

- AWS EC2 instance (Ubuntu 22.04 LTS recommended)
- Minimum t3.medium instance (2 vCPU, 4GB RAM)
- Security group with ports 80, 443, and 22 open
- SSH access to the instance

## One-Click Deployment

### Step 1: Connect to your EC2 instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Install Docker and Docker Compose

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Log out and log back in for group changes to take effect
exit
```

### Step 3: Clone your repository

```bash
# After logging back in
cd ~
git clone <your-repository-url>
cd makememes.site
```

### Step 4: Configure environment variables

```bash
# The application will use default settings
# If you need custom configuration, edit docker-compose.yml
```

### Step 5: Deploy with one command

```bash
docker-compose up -d --build
```

This command will:
- Build the backend Docker image
- Build the frontend Docker image
- Pull the Nginx image
- Start all services
- Set up networking between containers

### Step 6: Verify deployment

```bash
# Check if all containers are running
docker-compose ps

# View logs
docker-compose logs -f

# Check health status
docker-compose ps | grep -i healthy
```

### Step 7: Access your application

Open your browser and navigate to:
- **Application**: `http://your-ec2-public-ip`
- **API**: `http://your-ec2-public-ip/api`

## Managing the Application

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Restart services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop services
```bash
docker-compose down
```

### Update and redeploy
```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Clean up old images
```bash
docker system prune -a
```

## Optional: SSL Configuration with Let's Encrypt

To enable HTTPS:

1. Point your domain to the EC2 instance IP
2. Install certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

3. Create SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

4. Update `nginx.conf` to include SSL configuration
5. Restart nginx:
```bash
docker-compose restart nginx
```

## Troubleshooting

### Containers not starting
```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps
```

### Port already in use
```bash
# Check what's using port 80
sudo lsof -i :80

# Kill the process or change docker-compose.yml port mapping
```

### Out of memory
- Upgrade to a larger EC2 instance
- Add swap space

### Permission issues
```bash
# Ensure proper permissions
sudo chown -R $USER:$USER .
```

## Monitoring

### Resource usage
```bash
# Container resource usage
docker stats

# System resource usage
htop
```

### Health checks
```bash
# Backend health
curl http://localhost/api/health

# Frontend health
curl http://localhost
```

## Security Best Practices

1. Use EC2 security groups to restrict access
2. Keep Docker and system packages updated
3. Use secrets management for sensitive data
4. Enable SSL/TLS for production
5. Set up CloudWatch monitoring
6. Regular backups of meme_bank.json

## Auto-start on boot

Services are configured with `restart: unless-stopped` and will automatically start on EC2 reboot.

## Support

For issues, check:
- Container logs: `docker-compose logs`
- System logs: `sudo journalctl -u docker`
- EC2 console for instance health
