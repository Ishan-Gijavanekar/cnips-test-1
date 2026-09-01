package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"bytes"
	"io"
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

func createHubspotCompany(user CidaasUser, config map[string]string) (*Company, error) {
	url := config["hubspotBaseURL"] + "/crm/v3/objects/companies"
	method := "POST"
	client := &http.Client{}
	rawPayload := Company{
		Properties: CompanyProperties{
			Name:   user.CustomFields["company_name"].(string),
			Domain: user.CustomFields["company_domain_url"].(string),
		}}
	payloadBytes, err := json.Marshal(rawPayload)
	if err != nil {
		return nil, fmt.Errorf("Failed to marshal request body for company creation. Error: %+v", err)
	}
	payloadReader := bytes.NewReader(payloadBytes)
	req, err := http.NewRequest(method, url, payloadReader)
	if err != nil {
		return nil, fmt.Errorf("Failed to build http request. Reason: %+v", err)
	}
	req.Header.Add("Authorization", "Bearer "+config["hubspotToken"])
	req.Header.Add("Content-Type", "application/json")
	res, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Failed to send http request. Reason: %+v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("Unexpected response status. Response: %+v, Payload: %+v", res, rawPayload)
	}
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("Failed to read response body. Error: %+v", body)
	}
	var resBody Company
	if err := json.Unmarshal(body, &resBody); err != nil {
		return nil, fmt.Errorf("Unable to unmarshal response body. Error: %+v", err)
	}
	return &resBody, nil
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
	company, err := createHubspotCompany(cidaasUser, config)
	if err != nil {
		return "", fmt.Errorf("Failed to create company in hubspot. Error: %+v", err)
	}
	// TODO: Add company to event
	myEvent["company"] = company
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}