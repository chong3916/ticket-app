package broker

type MessageBroker interface {
	Publish(exchangeName string, payload any) error
	Subscribe(queueName string, exchangeName string, handler func(payload []byte)) error
}
