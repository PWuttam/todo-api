# ==========================
# Makefile for todo-api
# ==========================

# Shortcut to start containers
up:
	docker compose up -d

# Start with build (for first time)
build:
	docker compose up --build -d

# Stop containers
down:
	docker compose down

# Restart containers
restart:
	docker compose down
	docker compose up -d

# Show logs (API)
logs:
	docker logs -f todo-api

# Show logs (Mongo)
mongo-logs:
	docker logs -f todo-mongo

# Open Mongo shell
mongo:
	docker exec -it todo-mongo mongosh

# Remove all containers + volumes (dangerous)
clean:
	docker compose down --volumes --remove-orphans