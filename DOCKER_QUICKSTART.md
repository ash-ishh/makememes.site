# Docker Quick Start Guide

## One-Click Deployment

### On EC2 (Ubuntu)

1. **Install Docker & Docker Compose** (one-time setup):
```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone and Deploy**:
```bash
git clone <your-repo-url>
cd makememes.site
docker-compose up -d --build
```

3. **Access**: Open `http://your-ec2-ip` in your browser

### Using the Deploy Script

```bash
# Interactive deployment menu
./deploy.sh

# Options:
# 1. Fresh deployment (first time)
# 2. Update deployment (pull latest changes)
# 3. Stop all services
# 4. View logs
# 5. Check status
```

## Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart backend

# Check status
docker-compose ps

# Rebuild after code changes
docker-compose up -d --build
```

## Architecture

```
Internet
    ↓
Nginx (Port 80/443)
    ↓
    ├── Frontend (Next.js on port 3000)
    └── Backend (FastAPI on port 8000)
```

## Services

- **nginx**: Reverse proxy (ports 80, 443)
- **frontend**: Next.js application (internal port 3000)
- **backend**: FastAPI application (internal port 8000)

## URLs

- Application: `http://your-server/`
- API: `http://your-server/api/`
- Health Check: `http://your-server/api/health`

## Troubleshooting

**Containers won't start?**
```bash
docker-compose logs
```

**Port already in use?**
```bash
sudo lsof -i :80
# Kill the process or change port in docker-compose.yml
```

**Update not reflecting?**
```bash
docker-compose down
docker-compose up -d --build --force-recreate
```

## Production Checklist

- [ ] Set up SSL with Let's Encrypt (see DEPLOYMENT.md)
- [ ] Configure EC2 security groups (ports 22, 80, 443)
- [ ] Set up CloudWatch monitoring
- [ ] Configure automatic backups for meme_bank.json
- [ ] Update CORS origins in backend for your domain
- [ ] Set up domain DNS to point to EC2

## Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive documentation.
