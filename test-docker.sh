#!/bin/bash

echo "🐳 Testing Docker Setup for Escape Room App"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo ""
echo "1. Checking Docker daemon..."
if docker ps > /dev/null 2>&1; then
    print_status 0 "Docker daemon is running"
else
    print_status 1 "Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

echo ""
echo "2. Validating Docker Compose configuration..."
if docker-compose config > /dev/null 2>&1; then
    print_status 0 "Docker Compose configuration is valid"
else
    print_status 1 "Docker Compose configuration has errors"
    docker-compose config
    exit 1
fi

echo ""
echo "3. Building Docker image..."
if docker build -t escape-room-test . > /dev/null 2>&1; then
    print_status 0 "Docker image built successfully"
else
    print_status 1 "Docker image build failed"
    echo "Build output:"
    docker build -t escape-room-test .
    exit 1
fi

echo ""
echo "4. Testing Docker Compose services..."
echo "Starting services in detached mode..."

# Stop any existing containers
docker-compose down > /dev/null 2>&1

# Start services
if docker-compose up -d > /dev/null 2>&1; then
    print_status 0 "Services started successfully"
    
    echo ""
    echo "5. Waiting for services to be ready..."
    sleep 15
    
    echo ""
    echo "6. Checking service health..."
    
    # Check if database is healthy
    if docker-compose exec -T database pg_isready -U postgres > /dev/null 2>&1; then
        print_status 0 "Database is healthy"
    else
        print_warning "Database health check failed"
    fi
    
    # Check if app is running
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_status 0 "Application is accessible at http://localhost:3000"
    else
        print_warning "Application not yet accessible (may need more time to start)"
    fi
    
    echo ""
    echo "7. Service status:"
    docker-compose ps
    
    echo ""
    echo "8. Testing escape room endpoint..."
    if curl -s http://localhost:3000/escape-rooms > /dev/null 2>&1; then
        print_status 0 "Escape room page is accessible"
    else
        print_warning "Escape room page not accessible"
    fi
    
    echo ""
    echo "9. Stopping services..."
    docker-compose down
    print_status 0 "Services stopped"
    
else
    print_status 1 "Failed to start services"
    echo "Error output:"
    docker-compose up
    exit 1
fi

echo ""
echo "🎉 Docker setup verification complete!"
echo ""
echo "To manually test your Docker setup:"
echo "1. Run: docker-compose up"
echo "2. Visit: http://localhost:3000"
echo "3. Visit: http://localhost:3000/escape-rooms"
echo "4. Stop with: docker-compose down"
