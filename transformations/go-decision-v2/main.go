package handler

import (
	"encoding/json"

	"github.com/zinscky/log"
)

type MyEvent struct {
	Sub       string `json:"sub"`
	CharCount int    `json:"charCount"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (bool, error) {
	log.Info("inside decision")
	// unmarshal incoming event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return false, err
	}
	// apply your decision logic
	if len(myEvent.Sub) % 2 == 0 {
		return true, nil
	}
	return false, nil
}
