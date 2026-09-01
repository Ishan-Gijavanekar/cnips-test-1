package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/zinscky/log"
	"io"
	"net/http"
	"time"
)

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	clientId := config["client_id"]
	clientSecret := config["client_secret"]
	baseUrl := config["base_url"]
	var err error
	token := vars["access_token"]
	if token != "" {
		var ok bool
		ok, err = CheckTokenValid(token, baseUrl)
		if err != nil { 
			return "", err
		}
		if !ok {
			token, err = GetToken(baseUrl, clientId, clientSecret)
			if err != nil {
				return "", err
			}
		}
	} else {
		token, err = GetToken(baseUrl, clientId, clientSecret)
		if err != nil {
			// fmt.Println("Error gettisng token ", err)
			return "", err
		}
	}
	vars["access_token"] = token

	//fmt.Println("AccessToken: ", token)
	//Parse Event for sub
	var ingestionEvent IngestionEvent

	// Parse the JSON string
	err = json.Unmarshal([]byte(event), &ingestionEvent)
	if err != nil {
		log.Debug("Error parsing event JSON: %v", err)
	}
	user, err := GetUserInfo(baseUrl, token, ingestionEvent.Sub)
	if err != nil {
		// fmt.Println("error getting userInfo")
		return "", err
	}
	//fmt.Println("UserInfo with sub and Token: ", user)

	return user, nil
}

func GetUserInfo(baseUrl, token, sub string) (string, error) {

	// Create a new HTTP request
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/users-srv/userinfo/%s", baseUrl, sub), nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}
	// Set the content type header
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send userInfo request: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("users Srv response status is not OK. Status: %v", resp.Status)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read userInfo response body: %v", err)
	}
	var result UserInfo
	err = json.Unmarshal(body, &result)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal userInfo response body: %v", err)
	}
	// fmt.Println("UserInfo Response:", result)
	destinationEvent := DestinationEvent{
		AccessToken: token,
		UserInfo:    result,
		Sub:         sub,
	}
	jsonData, err := json.Marshal(destinationEvent)
	if err != nil {
		//log.Debug("Error marshaling UserInfo response to JSON: %v", err)
	}
	return string(jsonData), nil
}

func CheckTokenValid(token, baseUrl string) (bool, error) {
	body := map[string]string{
		"token": token,
	}
	reqBody, _ := json.Marshal(body)
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/token-srv/introspect", baseUrl), bytes.NewBuffer(reqBody))
	if err != nil {
		return false, fmt.Errorf("failed to create request: %v", err)
	}
	// Set the content type header
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Errorf("failed to introspect request: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 && resp.StatusCode != 500 {
		return false, fmt.Errorf("token introspect response status is not OK. Status: %v", resp.Status)
	}
	// Read the response body
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, fmt.Errorf("failed to read response body: %v", err)
	}

	// Parse the response JSON
	type introResp struct {
		Active bool
	}
	intro := &introResp{}
	err = json.Unmarshal(bodyBytes, intro)
	if err != nil {
		return false, fmt.Errorf("failed to unmarshal response body: %v", err)
	}
	return intro.Active, nil
}

func GetToken(baseUrl, clientId, clientSecret string) (string, error) {
	// Create a new request body
	tokenRequest := TokenRequest{
		GrantType:    "client_credentials",
		ClientID:     clientId,
		ClientSecret: clientSecret,
	}

	// Convert the request body to JSON
	requestBody, err := json.Marshal(tokenRequest)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request body: %v", err)
	}
	// Create a new HTTP request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/token-srv/token", baseUrl), bytes.NewBuffer(requestBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}
	// Set the content type header
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("token Srv response status is not OK. Status: %v", resp.Status)
	}
	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	// Parse the response JSON
	var tokenResp TokenResponse
	err = json.Unmarshal(body, &tokenResp)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal response body: %v", err)
	}
	if tokenResp.Error != "" {
		return "", fmt.Errorf("error obtaining token: %s", tokenResp.Error)
	}

	return tokenResp.AccessToken, nil
}

func Teardown(config map[string]string) error {
	//fmt.Println("XForm - config1:", config)
	//fmt.Println("Teardown - testing")
	return nil
}

type TokenRequest struct {
	GrantType    string `json:"grant_type"`
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	Scope        string `json:"scope"`
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Error       string `json:"error"`
}

type IngestionEvent struct {
	Sub string `json:"sub"`
}

type DestinationEvent struct {
	AccessToken string   `json:"access_token"`
	UserInfo    UserInfo `json:"userInfo"`
	Sub         string   `json:"sub"`
}

type UserInfo struct {
	LastUsedIdentityID string            `json:"last_used_identity_id"`
	Sub                string            `json:"sub"`
	UpdatedAt          int               `json:"updated_at"`
	CreatedTime        time.Time         `json:"createdTime"`
	UserStatus         string            `json:"userStatus"`
	LastLoggedInTime   time.Time         `json:"lastLoggedInTime"`
	CustomFields       map[string]string `json:"customFields"`
	Email              string            `json:"email"`
	EmailVerified      bool              `json:"email_verified"`
	Provider           string            `json:"provider"`
	GivenName          string            `json:"given_name"`
	FamilyName         string            `json:"family_name"`
	Roles              []string          `json:"roles"`
	PreferredUsername  string            `json:"preferred_username"`
	Name               string            `json:"name"`
	LastAccessedAt     int               `json:"last_accessed_at"`
}
