package handler

import (
	"encoding/json"

	"github.com/zinscky/log"
)

type MyEvent struct {
	Category string `json:"category"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside switch")

	// unmarshal incoming event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return "", err
	}

	var result string

	switch myEvent.Category {
	case "user_added":
		result = "joiner"

	case "user_deleted":
		result = "mover"

	default:
		result = "leaver"
	}

	// MUST return string label (not JSON)
	return result, nil
}
