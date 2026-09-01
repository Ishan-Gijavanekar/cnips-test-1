
package main

import (
	"github.com/zinscky/log"
	"io"
	"net/http"
	"net/url"
	"encoding/json"
	"fmt"
	"github.com/pkg/errors"
	"time"
	"bytes"
)

func Setup(config map[string]string, log *log.Logger) error { /* optional */
        //setup connection
	return nil
}

func Teardown(config map[string]string, log *log.Logger) error {/* optional */
        //teardown connection
	return nil
}

func Execute(config map[string]string, event string, vars map[string]string, log *log.Logger) (map[string]string, error) {
	baseUrl := config["base_url"]
	clientId := config["client_id"]
	clientSecret := config["client_secret"]
	log.Debug("")
	//1. Unmarshal Incoming event
	var incomingEvent Event
	err := json.Unmarshal([]byte(event), &incomingEvent)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal incoming event body: %v", err)
	}
	log.Debug("incomingEvent: ", incomingEvent)
	token, err := GenerateToken(baseUrl, clientId, clientSecret)
	if err != nil {
		fmt.Println("Error generating token: ", err)
		return nil, fmt.Errorf("error generating token: %v", err)
	}
	incomingEvent.Token = token
	updatedUser, err := UpdateUser(incomingEvent.UserInfo, incomingEvent.Token, baseUrl)
	if err != nil {
		fmt.Println("error updating user: ", err)
		return nil, fmt.Errorf("error updating user: %v", err)
	}
	log.Debug(fmt.Sprintf("updated userInfo: %v ", updatedUser))
	return vars, nil
}

type Event struct {
	Sub       string
	Processed bool
	Token     string
	UserInfo  UserInfo
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Error       string `json:"error"`
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

type UpdateUserInfoResponse struct {
	Data    UserInfo `json:"data"`
	Status  int64    `json:"status"`
	Success bool     `json:"success"`
}

func GenerateToken(baseUrl, clientId, clientSecret string) (string, error) {
	tokenReq := url.Values{
		"client_id":     []string{clientId},
		"client_secret": []string{clientSecret},
		"grant_type":    []string{"client_credentials"},
	}
	tokenURL, _ := url.JoinPath(baseUrl, "token-srv", "token")
	//resp, err := httpclient.PostForm(tokenURL, tokenReq)
	resp, err := http.PostForm(tokenURL, tokenReq)
	if err != nil {
		return "", err
	}
	if resp.StatusCode != http.StatusOK {
		return "", errors.Errorf("non success status code from token api - status code is (%s)", resp.Status)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("error parsing response body for api:", err)
		return "", errors.Errorf("error parsing response body for api %s - (%v)", tokenURL, err)
	}
	var tokenResponse TokenResponse
	err = json.Unmarshal(body, &tokenResponse)
	if err != nil {
		return "", errors.Errorf("error unmarshalling response body for api %s - (%v)", tokenURL, err)

	}
	return tokenResponse.AccessToken, nil
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
