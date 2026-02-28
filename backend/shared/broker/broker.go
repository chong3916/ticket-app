package broker

type MessageBroker interface {
	Publish(topic string, payload any) error
	Subscribe(topic string, handler func(payload []byte)) error
}
