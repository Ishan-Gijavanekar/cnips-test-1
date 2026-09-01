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

func searchForExistingCompany(cidaasUser CidaasUser, config map[string]string) ([]Company, error) {
	// Extract company domain from user's custom fields
	companyName, ok := cidaasUser.CustomFields["company_name"].(string)
	if !ok || companyName == "" {
		return []Company{}, fmt.Errorf("company_domain_url not found in user custom fields")
	}
	// Build HubSpot search URL
	url := config["hubspotBaseURL"] + "/crm/v3/objects/companies/search"
	method := "POST"
	// Create search payload
	searchPayload := map[string]interface{}{
		"filterGroups": []map[string]interface{}{
			{
				"filters": []map[string]interface{}{
					{
						"propertyName": "name",
						"operator":     "EQ",
						"value":        companyName,
					},
				},
			},
		},
		"properties": []string{"name", "domain", "city", "country", "state"},
	}
	payloadBytes, err := json.Marshal(searchPayload)
	if err != nil {
		return []Company{}, fmt.Errorf("failed to marshal search payload: %+v", err)
	}
	// Create HTTP request
	client := &http.Client{}
	req, err := http.NewRequest(method, url, bytes.NewReader(payloadBytes))
	if err != nil {
		return []Company{}, fmt.Errorf("failed to create HTTP request: %+v", err)
	}
	req.Header.Add("Authorization", "Bearer "+config["hubspotToken"])
	req.Header.Add("Content-Type", "application/json")
	// Send request
	res, err := client.Do(req)
	if err != nil {
		return []Company{}, fmt.Errorf("failed to send HTTP request: %+v", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return []Company{}, fmt.Errorf("unexpected response status: %d", res.StatusCode)
	}
	// Read response body
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return []Company{}, fmt.Errorf("failed to read response body: %+v", err)
	}
	// Parse response
	var searchResponse struct {
		Results []Company `json:"results"`
	}
	if err := json.Unmarshal(body, &searchResponse); err != nil {
		return []Company{}, fmt.Errorf("failed to unmarshal response: %+v", err)
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
	existingCompany, err := searchForExistingCompany(cidaasUser, config)
	if err != nil {
		return "", fmt.Errorf("Failed to search for existing company. Error: %+v", err)
	}
	myEvent["company"] = existingCompany
	log.Info(fmt.Sprintf("Adding the company ( %+v ) to the event.", existingCompany))
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}