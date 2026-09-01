
package main

import (
	"github.com/zinscky/log"
	"net"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// this can be defined by you based
// on your event structure
type Event struct {
	Payload     Payload `json:"payload,omitempty"`
}
type Payload struct {
	Employment  map[string]interface{} 

}


// Run function parameters
//
//  1. config - key value pair configured in the transformation
//  2. event - your event data as json string. you need to manualy 
//             unmarshal it into appropriate struct.
//  3. vars - these are global variable and can be accessed by all 
//            transformations/destination in the given pipeline.
//  4. log - the thread safe logger. log.Info, log.Debug, log.Warn, log.Error.
//
// Returns
//
//  1. the modified event. pipeline will fail if it is not returned.
//  2. vars - the global pariable passed in this fuction.
//  3. error

func Run(
	config map[string]string,
	event string,
	vars map[string]string,
	log *log.Logger,
) (string, map[string]string, error) {
	log.Info("incoming event %s", event)
	myEvent := &Event{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return event, vars, err
	}
	log.Info("incoming event %s", event)
	token, err := GetPersonioToken(config["client_id"], config["client_secret"], config["grant_type"])
	if err != nil {
		return event, vars, err
	}
	log.Info("personio token %s", token)
	return event, vars, nil
}

type PersionioToken struct {
	AccessToken  string `json:"access_token,omitempty"`

}
func GetPersonioToken(clientID string, clientSecret string, grantType string) (string, error) {
	tokenUrl := "https://api.personio.de/v2"
    data := url.Values{}
	data.Set("client_id", clientID)
	data.Set("grant_type", grantType)
	data.Set("client_secret", clientSecret)
	payload := strings.NewReader(data.Encode())
	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%v/%v", tokenUrl, "auth/token"), payload)
	if err != nil {
		return "", err
	}
	defaultTransport := &http.Transport{}
	defaultTransport.DialContext = (&net.Dialer{}).DialContext
	defaultTransport.ForceAttemptHTTP2 = false
	client := http.Client{Timeout: time.Second*2, Transport: defaultTransport}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("do Request: Request failed, %w", err)
	}
	token := PersionioToken{}
	err = json.NewDecoder(resp.Body).Decode(token)
	if err != nil {
		return "", fmt.Errorf("do Request: Request failed, %w", err)
	}
	return token.AccessToken, err

}
