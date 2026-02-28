.PHONY: dev-infra dev-services stop

export DATABASE_URL=postgres://user:password@localhost:5432/todo_db?sslmode=disable
export RABBITMQ_URL=amqp://guest:guest@localhost:5672/
export JWT_SECRET=CHANGE_ME

dev-infra:
	docker-compose up -d db rabbitmq

dev-services:
	make -j 3 api worker notification

api:
	go run ./backend/api/main.go

worker:
	go run ./backend/worker

notification:
	go run ./backend/notification/main.go

stop:
	docker-compose down