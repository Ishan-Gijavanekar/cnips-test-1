package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	
	"github.com/zinscky/log"
)

type CidaasUser struct {
	Sub           string                 `json:"sub"`
	UserStatus    string                 `json:"userStatus"`
	CustomFields  map[string]interface{} `json:"customFields"`
	Email         string                 `json:"email"`
	EmailVerified bool                   `json:"email_verified"`
	GivenName     string                 `json:"given_name"`
	FamilyName    string                 `json:"family_name"`
	MobileNumber  string                 `json:"mobile_number"`
}

type CompanyProperties struct {
	Name    string `json:"name"`
	Domain  string `json:"domain"`
	City    string `json:"city"`
	Country string `json:"country"`
	State   string `json:"state"`
}

type Company struct {
	Properties CompanyProperties `json:"properties"`
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
	rawUser, ok := myEvent["cidaasUser"]
	if !ok {
		return false, errors.New("cidaasUser field is missing in event")
	}
	if rawUser == nil {
		return false, errors.New("cidaasUser field is nil in event")
	}
	unmarshal := func(v interface{}, target interface{}) error {
		b, err := json.Marshal(v)
		if err != nil {
			return err
		}
		return json.Unmarshal(b, target)
	}
	var hubspotCompany []Company
	if err := unmarshal(myEvent["company"], &hubspotCompany); err != nil {
		return false, fmt.Errorf("Failed to unmarshal cidaasUser field from event. Error: %+v", err)
	}
	// search for already existing company
	log.Info(fmt.Sprintf("Company: %+v", hubspotCompany))
	log.Info(fmt.Sprintf("End of decision block with result: %v", len(hubspotCompany) > 0))
	return len(hubspotCompany)>0, nil
}