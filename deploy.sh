#!/bin/bash

# MakeMemes Deployment Script
# This script automates the deployment process

set -e

echo "=========================================="
echo "  MakeMemes Deployment Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Run: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi
print_success "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    echo "Run: sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "     sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi
print_success "Docker Compose is installed"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found in current directory"
    exit 1
fi
print_success "docker-compose.yml found"

echo ""
echo "=========================================="
echo "  Deployment Options"
echo "=========================================="
echo "1. Fresh deployment (stop and rebuild all containers)"
echo "2. Update deployment (pull latest code and rebuild)"
echo "3. Stop all services"
echo "4. View logs"
echo "5. Check status"
echo ""
read -p "Select an option (1-5): " option

case $option in
    1)
        echo ""
        print_warning "Starting fresh deployment..."

        # Stop and remove existing containers
        if docker-compose ps -q 2>/dev/null | grep -q .; then
            print_warning "Stopping existing containers..."
            docker-compose down
        fi

        # Build and start containers
        print_warning "Building and starting containers..."
        docker-compose up -d --build

        echo ""
        print_success "Deployment complete!"
        echo ""
        echo "Services are starting up. Please wait 30-60 seconds..."
        echo "Access your application at: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-ec2-ip')"
        echo ""
        echo "Run './deploy.sh' and select option 5 to check status"
        ;;

    2)
        echo ""
        print_warning "Updating deployment..."

        # Pull latest code (if git repo)
        if [ -d ".git" ]; then
            print_warning "Pulling latest code..."
            git pull
        fi

        # Rebuild and restart
        print_warning "Rebuilding containers..."
        docker-compose up -d --build

        print_success "Update complete!"
        ;;

    3)
        echo ""
        print_warning "Stopping all services..."
        docker-compose down
        print_success "All services stopped"
        ;;

    4)
        echo ""
        print_warning "Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;

    5)
        echo ""
        echo "=========================================="
        echo "  Service Status"
        echo "=========================================="
        docker-compose ps
        echo ""
        echo "=========================================="
        echo "  Container Health"
        echo "=========================================="
        docker-compose ps --format json | grep -o '"Health":"[^"]*"' | sed 's/"Health":"//g' | sed 's/"//g' || echo "No health check info available"
        echo ""
        ;;

    *)
        print_error "Invalid option"
        exit 1
        ;;
esac
