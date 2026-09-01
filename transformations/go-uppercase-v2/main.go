package handler

import (
	"strings"
	"encoding/json"

	"github.com/zinscky/log"
)

type MyEvent struct {
	Sub       string `json:"sub"`
	CharCount int    `json:"charCount"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside transformation")
	// unmarshal incoming  event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return "", err
	}
	// apply your transformation logic
	myEvent.Sub = strings.ToUpper(myEvent.Sub)
	// marshal your event back to jsons is
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}
