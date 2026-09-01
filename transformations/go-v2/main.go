package handler

import (
	"encoding/json"

	"github.com/zinscky/log"
)

type MyEvent struct {
	Sub       string `json:"sub"`
	CharCount int    `json:"charCount"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (bool, map[string]string, error) {
	log.Info("inside decision")
	// unmarshal incoming  event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return false, vars, err
	}
	// apply your decision logic3
	if len(myEvent.Sub) % 2 == 0 {
		return true, vars, nil
	}
	return false, vars, nil
}
