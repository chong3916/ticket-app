FROM golang:1.25-alpine AS builder
WORKDIR /app

COPY go.work go.work.sum* ./

COPY backend/api/go.mod backend/api/go.sum* ./backend/api/
COPY backend/worker/go.mod backend/worker/go.sum* ./backend/worker/
COPY backend/notification/go.mod backend/notification/go.sum* ./backend/notification/
COPY backend/shared/go.mod backend/shared/go.sum* ./backend/shared/

RUN go mod download

COPY . .
RUN go build -o main ./backend/notification/main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]