package broker

import (
	"encoding/json"
	"github.com/rabbitmq/amqp091-go"
)

type RabbitMQBroker struct {
	conn    *amqp091.Connection
	channel *amqp091.Channel
}

func NewRabbitMQBroker(conn *amqp091.Connection, ch *amqp091.Channel) *RabbitMQBroker {
	return &RabbitMQBroker{
		conn:    conn,
		channel: ch,
	}
}

func (r *RabbitMQBroker) Publish(topic string, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return r.channel.Publish(
		topic,
		"",
		false,
		false,
		amqp091.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}

func (r *RabbitMQBroker) Subscribe(topic string, handler func(payload []byte)) error {
	msgs, err := r.channel.Consume(
		topic,
		"",
		false, // manual ack
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	go func() {
		for d := range msgs {
			handler(d.Body)
			d.Ack(false)
		}
	}()
	return nil
}
