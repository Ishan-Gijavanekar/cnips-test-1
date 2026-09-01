package handler

import (
	"encoding/json"
	"fmt"

	"github.com/zinscky/log"
)

type ContactProperties struct {
	CreateDate string `json:"createDate"`
	Email      string `json:"email"`
	FirstName  string `json:"firstname"`
	LastName   string `json:"lastname"`
}

type Contact struct {
	Properties ContactProperties `json:"properties"`
	ID         string            `json:"id"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (bool, error) {
	log.Info("inside transformation")
	// unmarshal incoming event to your struct
	myEvent := map[string]interface{}{}
	err := json.Unmarshal([]byte(event), &myEvent)
	if err != nil {
		return false, err
	}
	// apply your transformation logic
	unmarshal := func(v interface{}, target interface{}) error {
		b, err := json.Marshal(v)
		if err != nil {
			return err
		}
		return json.Unmarshal(b, target)
	}
	var hubspotContact Contact
	if err := unmarshal(myEvent["cidaasUser"], &hubspotContact); err != nil {
		return false, fmt.Errorf("Failed to unmarshal cidaasUser field from event. Error: %+v", err)
	}
	// search for already existing company
	return myEvent["contact"] != nil, nil
}