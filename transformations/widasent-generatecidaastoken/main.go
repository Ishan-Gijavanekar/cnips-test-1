package handler

import (
	"encoding/json"
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
	"github.com/zinscky/log"
)

/*
THIS TRANSFORMATION WILL EXTEND THE EVENT BY A CIDAAS_TOKEN.
ADDED FIELD TO EVENT:
	- "cidaasToken" : string -> can be used for authorization
*/

type CidaasTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
	TokenType   string `json:"Bearer"`
	Sub         string `json:"sub"`
	SID         string `json:"sid"`
}


// Function for receiving a cidaas token for authorization
func GetCidaasToken(config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	// Function for receiving a cidaas token for authorization
	url := config["cidaasBaseURL"] + "/token-srv/token"
	method := "POST"
	payload := map[string]string{
		"client_id":     config["cidaasClientID"],
		"client_secret": config["cidaasClientSecret"],
		"grant_type":    "client_credentials",
	}
	log.Info(fmt.Sprintf("PAYLOAD : %+v", payload))
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", errors.New(fmt.Sprintf("Error during building the payload for authorization request. Error: %+v", err))
	}
	payloadReader := bytes.NewReader(payloadBytes)
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest(method, url, payloadReader)
	if err != nil {
		return "", errors.New(fmt.Sprintf("Error during building the request. Error: %+v", err))
	}
	req.Header.Set("Content-Type", "application/json")
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK{
		return "", errors.New(fmt.Sprintf("Unexpected response status during token creation. Response: %+v", res))
	}
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", errors.New(fmt.Sprintf("Error extracting response body. Error: %+v", err))
	}
	var cidaasTokenResp CidaasTokenResponse
	if err := json.Unmarshal(body, &cidaasTokenResp); err != nil {
		return "", err
	}
	return cidaasTokenResp.AccessToken, nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	// unmarshal incoming event to your struct
	var myEvent map[string]interface{}
	err := json.Unmarshal([]byte(event), &myEvent)
	if err != nil {
		return "", err
	}
	log.Info(fmt.Sprintf("Inside transformation with event: %+v", myEvent))
	// send to destination
	token, err := GetCidaasToken(config, vars, log)
	if err != nil {
		return "", errors.New(fmt.Sprintf("Error during authentication. Error: %+v", err))
	}
	myEvent["cidaasToken"] = token
	//the dynamic_66d... field contains the employeeId of haufe. So when created in haufe it needs to be updated in personio.
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}


	log.Info(fmt.Sprintf("Finished transformation with event: %s", string(transformedEvent)))
	return string(transformedEvent), nil
}
