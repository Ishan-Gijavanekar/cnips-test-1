package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/zinscky/log"
)

type LinkingPayload struct {
	Category string  `json:"associationCategory"`
	TypeId   float64 `json:"associationTypeId"`
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

func linkinCompanyAndContact(company Company, contact Contact, config map[string]string) error {
	url := config["hubspotBaseURL"] + fmt.Sprintf("/crm/v4/objects/contacts/%s/associations/companies/%s", contact.ID, company.ID)
	method := "PUT"
	client := &http.Client{}
	payload := []LinkingPayload{{
		Category: "HUBSPOT_DEFINED",
		TypeId:   1,
	},}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("Failed to marshal request body for company creation. Error: %+v", err)
	}
	req, err := http.NewRequest(method, url, bytes.NewReader(payloadBytes))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %+v", err)
	}
	req.Header.Add("Authorization", "Bearer "+config["hubspotToken"])
	req.Header.Add("Content-Type", "application/json")
	res, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send HTTP request: %+v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		return fmt.Errorf("unexpected response status: %d, payload: %+v", res.StatusCode, payload)
	}
	return nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside transformation")
	// unmarshal incoming event to your struct
	myEvent := map[string]interface{}{}
	err := json.Unmarshal([]byte(event), &myEvent)
	if err != nil {
		return "", err
	}
	// apply your transformation logic
	unmarshal := func(v interface{}, target interface{}) error {
		b, err := json.Marshal(v)
		if err != nil {
			return err
		}
		return json.Unmarshal(b, target)
	}
	var company Company
	if err := unmarshal(myEvent["company"], &company); err != nil {
		return "", fmt.Errorf("Failed to unmarshal cidaasUser field from event. Error: %+v", err)
	}
	var contact Contact
	if err := unmarshal(myEvent["contact"], &contact); err != nil {
		return "", fmt.Errorf("Failed to unmarshal cidaasUser field from event. Error: %+v", err)
	}
	// Building request body
	err = linkinCompanyAndContact(company, contact, config)
	if err != nil {
		return "", fmt.Errorf("Failed to linking company ( %+v ) and contact ( %+v ). Error: %+v", company, contact, err)
	}
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}