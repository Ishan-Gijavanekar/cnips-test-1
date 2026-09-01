package handler

import (
	"bytes"
	"encoding/json"
	"github.com/zinscky/log"
	"fmt"
	"io"
	"net/http"
	"time"
)

func Setup(config map[string]string) error {
	//fmt.Println("XForm - config1:", config)
	fmt.Println("Setup - testing")
	return nil
}

func UpdateUser(userInfo UserInfo, accessToken, baseUrl string) (*UserInfo, error) {
	//fmt.Println("Updating UserInfo: ", userInfo)
	requestBody, err := json.Marshal(userInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal userinfo  body: %v", err)
	}
	// Create a new HTTP request
	req, err := http.NewRequest("PUT", fmt.Sprintf("%s/users-srv/user/%s", baseUrl, userInfo.Sub), bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create update user request: %v", err)
	}
	// Set the content type header
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send userinfo update request: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("users Srv response status is not OK. Status: %v", resp.Status)
	}
	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read update userinfo response body: %v", err)
	}

	// Parse the response JSON
	var userInfoResponse UpdateUserInfoResponse
	err = json.Unmarshal(body, &userInfoResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal userInfo response body: %v", err)
	}
	//fmt.Println("sucess: ", userInfoResponse.Success)
	//fmt.Println("status: ", userInfoResponse.Status)
	if userInfoResponse.Status != 200 {
		return nil, fmt.Errorf("failed to update userInfo response status: %v", userInfoResponse.Status)

	}
	return &userInfoResponse.Data, nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger)  error {
	//fmt.Println("Incoming Event: ", event)
	baseUrl := config["base_url"]
	//1. Unmarshal Incoming DestinationEvent
	var destinationEvent DestinationEvent
	err := json.Unmarshal([]byte(event), &destinationEvent)
	if err != nil {
		return fmt.Errorf("failed to unmarshal incoming event body: %v", err)
	}
	//2. change family name & Given name
	destinationEvent.UserInfo.GivenName = "_Go_GivenName"
	destinationEvent.UserInfo.FamilyName = "_Go_FamilyName"
	//3. Call update userInfo from the token in Update
	_, err = UpdateUser(destinationEvent.UserInfo, destinationEvent.AccessToken, baseUrl)
	if err != nil {
		//fmt.Println("error updating user")
		return err
	}
	//fmt.Println("user updated: ", resp)
	//4. Log the response/error
	return nil
}

func Teardown(config map[string]string) error {
	//fmt.Println("XForm - config1:", config)
	fmt.Println("Teardown - testing")
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

type UpdateUserInfoResponse struct {
	Data    UserInfo `json:"data"`
	Status  int64    `json:"status"`
	Success bool     `json:"success"`
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
