# AI Learning Assistant - Makefile
# Convenient commands for development and deployment

.PHONY: help dev prod test clean build deploy logs

# Default target
help:
	@echo "AI Learning Assistant - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build and start development environment"
	@echo "  make dev-logs     - Show development logs"
	@echo "  make dev-stop     - Stop development environment"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build and start production environment"
	@echo "  make prod-logs    - Show production logs"
	@echo "  make prod-stop    - Stop production environment"
	@echo ""
	@echo "Testing:"
	@echo "  make test         - Run all tests"
	@echo "  make test-unit    - Run unit tests"
	@echo "  make test-integration - Run integration tests"
	@echo "  make test-e2e     - Run end-to-end tests"
	@echo ""
	@echo "Database:"
	@echo "  make db-seed      - Seed databases with sample data"
	@echo "  make db-migrate   - Run database migrations"
	@echo "  make db-reset     - Reset all databases"
	@echo "  make db-backup    - Create database backup"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        - Clean up containers and volumes"
	@echo "  make build        - Build all services"
	@echo "  make logs         - Show all service logs"
	@echo "  make health       - Check service health"
	@echo "  make setup        - Initial project setup"

# ============================================================================
# DEVELOPMENT COMMANDS
# ============================================================================

dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "API Gateway: http://localhost:3000"
	@echo "Web Frontend: http://localhost:3100"
	@echo "Grafana: http://localhost:3200"

dev-build:
	@echo "Building and starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
	@echo "Development environment built and started!"

dev-logs:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

dev-stop:
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
	@echo "Development environment stopped!"

# ============================================================================
# PRODUCTION COMMANDS
# ============================================================================

prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "Production environment started!"

prod-build:
	@echo "Building and starting production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
	@echo "Production environment built and started!"

prod-logs:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

prod-stop:
	@echo "Stopping production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
	@echo "Production environment stopped!"

# ============================================================================
# TESTING COMMANDS
# ============================================================================

test:
	@echo "Running all tests..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml --profile test up --abort-on-container-exit test-runner

test-unit:
	@echo "Running unit tests..."
	docker-compose exec learning-service npm run test:unit
	docker-compose exec productivity-service npm run test:unit
	docker-compose exec knowledge-graph-service npm run test:unit
	docker-compose exec content-service npm run test
	docker-compose exec analytics-service npm run test

test-integration:
	@echo "Running integration tests..."
	docker-compose exec api-gateway npm run test:integration

test-e2e:
	@echo "Running end-to-end tests..."
	docker-compose exec web-frontend npm run test:e2e

# ============================================================================
# DATABASE COMMANDS
# ============================================================================

db-seed:
	@echo "Seeding databases with sample data..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml --profile seed up --abort-on-container-exit db-seed
	@echo "Database seeding completed!"

db-migrate:
	@echo "Running database migrations..."
	docker-compose exec learning-service npm run migrate
	docker-compose exec productivity-service npm run migrate
	docker-compose exec content-service npm run migrate
	docker-compose exec analytics-service npm run migrate
	@echo "Database migrations completed!"

db-reset:
	@echo "Resetting all databases..."
	docker-compose down -v
	docker volume prune -f
	@echo "Databases reset! Run 'make dev' to restart with fresh databases."

db-backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U postgres ai_learning_assistant > backups/postgres_$(shell date +%Y%m%d_%H%M%S).sql
	docker-compose exec neo4j cypher-shell -u neo4j -p password "CALL apoc.export.cypher.all('/backups/neo4j_$(shell date +%Y%m%d_%H%M%S).cypher', {})"
	@echo "Database backup completed!"

# ============================================================================
# UTILITY COMMANDS
# ============================================================================

clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	docker volume prune -f
	@echo "Cleanup completed!"

build:
	@echo "Building all services..."
	docker-compose build --parallel
	@echo "Build completed!"

logs:
	docker-compose logs -f

health:
	@echo "Checking service health..."
	@echo "API Gateway:"
	@curl -f http://localhost:3000/health || echo "❌ API Gateway unhealthy"
	@echo "Learning Service:"
	@curl -f http://localhost:3001/health || echo "❌ Learning Service unhealthy"
	@echo "Productivity Service:"
	@curl -f http://localhost:3002/health || echo "❌ Productivity Service unhealthy"
	@echo "Knowledge Graph Service:"
	@curl -f http://localhost:3003/health || echo "❌ Knowledge Graph Service unhealthy"
	@echo "Content Service:"
	@curl -f http://localhost:3004/health || echo "❌ Content Service unhealthy"
	@echo "Analytics Service:"
	@curl -f http://localhost:3005/health || echo "❌ Analytics Service unhealthy"

setup:
	@echo "Setting up AI Learning Assistant..."
	@if [ ! -f .env ]; then \
		echo "Creating .env file from template..."; \
		cp .env.example .env; \
		echo "Please edit .env file with your configuration"; \
	fi
	@echo "Creating necessary directories..."
	@mkdir -p logs backups monitoring/grafana/dashboards monitoring/grafana/datasources
	@echo "Setup completed! Run 'make dev' to start development environment."

# ============================================================================
# MONITORING COMMANDS
# ============================================================================

monitor:
	@echo "Opening monitoring dashboards..."
	@echo "Grafana: http://localhost:3200 (admin/admin)"
	@echo "Prometheus: http://localhost:9090"
	@echo "Kibana: http://localhost:5601"
	@echo "pgAdmin: http://localhost:5050"
	@echo "Redis Commander: http://localhost:8081"

# ============================================================================
# DEPLOYMENT COMMANDS
# ============================================================================

deploy-staging:
	@echo "Deploying to staging environment..."
	# Add your staging deployment commands here
	@echo "Staging deployment completed!"

deploy-production:
	@echo "Deploying to production environment..."
	# Add your production deployment commands here
	@echo "Production deployment completed!"

# ============================================================================
# MAINTENANCE COMMANDS
# ============================================================================

update:
	@echo "Updating all services..."
	docker-compose pull
	docker-compose build --pull
	@echo "Update completed!"

restart:
	@echo "Restarting all services..."
	docker-compose restart
	@echo "Services restarted!"

scale:
	@echo "Scaling services for high load..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale learning-service=3 --scale productivity-service=2
	@echo "Services scaled!"