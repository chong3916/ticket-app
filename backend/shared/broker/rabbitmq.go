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

func (r *RabbitMQBroker) Publish(exchangeName string, payload any) error {
	err := r.channel.ExchangeDeclare(
		exchangeName,
		"fanout",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return r.channel.Publish(
		exchangeName,
		"",
		false,
		false,
		amqp091.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}

func (r *RabbitMQBroker) Subscribe(queueName string, exchangeName string, handler func(payload []byte)) error {
	err := r.channel.ExchangeDeclare(
		exchangeName,
		"fanout",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	_, err = r.channel.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	err = r.channel.QueueBind(
		queueName,
		"",
		exchangeName,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	msgs, err := r.channel.Consume(
		queueName,
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
