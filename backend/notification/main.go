package notification

import "log"

func main() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open channel: %v", err)
	}
	defer ch.Close()

	// Ensure infrastructure exists
	if err := SetupRabbitMQ(ch); err != nil {
		log.Fatalf("Failed to setup RabbitMQ: %v", err)
	}

	msgs, _ := ch.Consume("notification_queue", "", true, false, false, false, nil)

	// Use a channel to keep the process alive
	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("📩 Dispatching Notification: %s", d.Body)
			// Your logic: SendEmail(d.Body)
		}
	}()

	log.Println(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
