package handler

import (
	"encoding/json"
	"time"
	"github.com/zinscky/log"
)

type MyEvent struct {
	ActorID     string                  `json:"actorId"`
	ClientID    string                  `json:"client_id"`
	CreatedTime time.Time               `json:"createdTime"`
	EventType   string                  `json:"eventtype"`
	MetaData    *map[string]interface{} `json:"metaData"` // Pointer to handle null values
	ObjectID    string                  `json:"objectId"`
	ObjectType  string                  `json:"objectType"`
	Sub         string                  `json:"sub,omitempty"`
	TenantKey   string                  `json:"tenantKey"`
	UserID      string                  `json:"userId,omitempty"`
	ErrorMsg    string                  `json:"errorMsg,omitempty"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) error {
	log.Info("inside destination")
	// unmarshal incoming event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return err
	}
	
	log.Info("valid Webhook Event event %s", event)
	log.Info("No Gitlab Ticket will be created!!")
	// send to destination
	return nil
}
