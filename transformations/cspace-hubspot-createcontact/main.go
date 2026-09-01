package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
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

type ContactProperties struct {
	CreateDate string `json:"createDate,omitempty"`
	Email      string `json:"email"`
	FirstName  string `json:"firstname"`
	LastName   string `json:"lastname"`
	Company string `json:"company"`
	Phone string `json:"phone"`

}

type Contact struct {
	Properties ContactProperties `json:"properties"`
	ID         string            `json:"id,omitempty"`
}

func createHubspotContact(cidaasUser CidaasUser, config map[string]string) (Contact, error) {
	// Build HubSpot contact creation URL
	url := config["hubspotBaseURL"] + "/crm/v3/objects/contacts"
	method := "POST"
	// Create contact payload
	contactPayload := Contact{
		Properties: ContactProperties{
			Email:     cidaasUser.Email,
			FirstName: cidaasUser.GivenName,
			LastName:  cidaasUser.FamilyName,
			Company: cidaasUser.CustomFields["company_name"].(string),
			Phone: cidaasUser.MobileNumber,
		},
	}
	payloadBytes, err := json.Marshal(contactPayload)
	if err != nil {
		return Contact{}, fmt.Errorf("failed to marshal contact payload: %+v", err)
	}
	// Create HTTP request
	client := &http.Client{}
	req, err := http.NewRequest(method, url, bytes.NewReader(payloadBytes))
	if err != nil {
		return Contact{}, fmt.Errorf("failed to create HTTP request: %+v", err)
	}
	req.Header.Add("Authorization", "Bearer "+config["hubspotToken"])
	req.Header.Add("Content-Type", "application/json")
	// Send request
	res, err := client.Do(req)
	if err != nil {
		return Contact{}, fmt.Errorf("failed to send HTTP request: %+v", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		return Contact{}, fmt.Errorf("unexpected response status: %+v, payload: %+v", res.StatusCode, contactPayload)
	}
	// Read response body
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return Contact{}, fmt.Errorf("failed to read response body: %+v", err)
	}
	// Parse response
	var contact Contact
	if err := json.Unmarshal(body, &contact); err != nil {
		return Contact{}, fmt.Errorf("failed to unmarshal response: %+v", err)
	}
	return contact, nil
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
	rawUser, ok := myEvent["cidaasUser"]
	if !ok {
		return "", errors.New("cidaasUser field is missing in event")
	}
	if rawUser == nil {
		return "", errors.New("cidaasUser field is nil in event")
	}
	unmarshal := func(v interface{}, target interface{}) error {
		b, err := json.Marshal(v)
		if err != nil {
			return err
		}
		return json.Unmarshal(b, target)
	}
	var cidaasUser CidaasUser
	if err := unmarshal(myEvent["cidaasUser"], &cidaasUser); err != nil {
		return "", fmt.Errorf("Failed to unmarshal cidaasUser field from event. Error: %+v", err)
	}
	// Building request body
	contact, err := createHubspotContact(cidaasUser, config)
	if err != nil {
		return "", fmt.Errorf("Failed to create company in hubspot. Error: %+v", err)
	}
	// TODO: Add company to event
	myEvent["contact"] = contact
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}