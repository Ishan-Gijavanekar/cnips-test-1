package handler

import (
	"encoding/json"

	"github.com/zinscky/log"
)

type MyEvent struct {
	EventType   string    `json:"eventtype"`
	Sub         string    `json:"sub"`
	ClientId    string    `json:"client_id"`
	TenantKey   string    `json:"tenantKey"`
	UserId      string    `json:"userId"`
	ActorId     string    `json:"actorId"`
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
	if myEvent.ClientId == config["client_Id"] {
		return true, nil
	}
	log.Info("client_id is not matching with self sign up. Instead its: " + myEvent.ClientId)
	return false, nil
}
