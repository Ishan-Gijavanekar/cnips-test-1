package handler

import (
	"encoding/json"

	"github.com/zinscky/log"
)

type MyEvent struct {
	Sub       string `json:"sub"`
	CharCount int    `json:"charCount"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) error {
	log.Info("inside destination with incomming event: " + event)
	// unmarshal incoming event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return err
	}
	// send to destination
	return nil
}
