package handler

import (
	"encoding/json"
    "time"
	"github.com/zinscky/log"
)

// MyEvent represents the webhook event structure
type MyEvent struct {
	ActorID     string                 `json:"actorId"`
	ClientID    string                 `json:"client_id"`
	CreatedTime time.Time              `json:"createTime"`
	EventType   string                 `json:"eventtype"`
	MetaData    map[string]interface{} `json:"metaData"`
	ObjectID    string                 `json:"objectId"`
	ObjectType  string                 `json:"objectType"`
	Sub         string                 `json:"sub"`
	TenantKey   string                 `json:"tenantKey"`
	UserID      string                 `json:"userId"`
	ErrorMsg    string                 `json:"errorMsg"`
	CidaasVersion string               `json:"cidaasVersion,omitempty"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) error {
	log.Info("inside destination") 
	// unmarshal incoming event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return err
	}
	// Marshal transformed event (including errorMsg if set)
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return err
	}
	log.Info("Event Data:", string(transformedEvent))
	// send to destination
	return nil
}
