.PHONY: up down logs restart seed

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose down && docker compose up -d

seed:
	docker compose exec api npm run seed
