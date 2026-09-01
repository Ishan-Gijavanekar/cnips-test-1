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
	CreateDate string `json:"createDate"`
	Email      string `json:"email"`
	FirstName  string `json:"firstname"`
	LastName   string `json:"lastname"`
}

type Contact struct {
	Properties ContactProperties `json:"properties"`
	ID         string            `json:"id"`
}

func searchForExistingContact(cidaasUser CidaasUser, config map[string]string) ([]Contact, error) {
	// Extract email from user for contact search
	email := cidaasUser.Email
	if email == "" {
		return []Contact{}, fmt.Errorf("email not found in cidaas user")
	}
	// Build HubSpot search URL
	url := config["hubspotBaseURL"] + "/crm/v3/objects/contacts/search"
	method := "POST"
	// Create search payload
	searchPayload := map[string]interface{}{
		"filterGroups": []map[string]interface{}{
			{
				"filters": []map[string]interface{}{
					{
						"propertyName": "email",
						"operator":     "EQ",
						"value":        email,
					},
				},
			},
		},
		"properties": []string{"firstname", "lastname", "email", "phone", "company"},
	}
	payloadBytes, err := json.Marshal(searchPayload)
	if err != nil {
		return []Contact{}, fmt.Errorf("failed to marshal search payload: %+v", err)
	}
	// Create HTTP request
	client := &http.Client{}
	req, err := http.NewRequest(method, url, bytes.NewReader(payloadBytes))
	if err != nil {
		return []Contact{}, fmt.Errorf("failed to create HTTP request: %+v", err)
	}
	req.Header.Add("Authorization", "Bearer "+config["hubspotToken"])
	req.Header.Add("Content-Type", "application/json")
	// Send request
	res, err := client.Do(req)
	if err != nil {
		return []Contact{}, fmt.Errorf("failed to send HTTP request: %+v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return []Contact{}, fmt.Errorf("unexpected response status: %d", res.StatusCode)
	}
	// Read response body
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return []Contact{}, fmt.Errorf("failed to read response body: %+v", err)
	}
	// Parse response
	var searchResponse struct {
		Results []Contact `json:"results"`
	}
	if err := json.Unmarshal(body, &searchResponse); err != nil {
		return []Contact{}, fmt.Errorf("failed to unmarshal response: %+v", err)
	}
	return searchResponse.Results, nil
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
	// search for already existing company
	existingContacts, err := searchForExistingContact(cidaasUser, config)
	if err != nil {
		return "", fmt.Errorf("Failed to search for existing company. Error: %+v", err)
	}
	if len(existingContacts) > 0 {
		myEvent["contact"] = existingContacts[0]
	}
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}