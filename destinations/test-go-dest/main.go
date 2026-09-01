
package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/pkg/errors"
	"github.com/zinscky/log"
	"io"
	"net/http"
	"net/url"
	"time"
)

func Setup(config map[string]string, log *log.Logger) error { /* optional */
        //setup connection
	return nil
}

func Teardown(config map[string]string, log *log.Logger) error {/* optional */
        //teardown connection
	return nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger)  error {
	baseUrl := config["base_url"]
	clientId := config["client_id"]
	clientSecret := config["client_secret"]
	log.Debug("")
	//1. Unmarshal Incoming event
	var incomingEvent Event
	err := json.Unmarshal([]byte(event), &incomingEvent)
	if err != nil {
		return fmt.Errorf("failed to unmarshal incoming event body: %v", err)
	}
	log.Debug("incomingEvent: ", incomingEvent)
	fmt.Println("incoming Event: ", incomingEvent)
	token, err := GenerateToken(baseUrl, clientId, clientSecret)
	if err != nil {
		fmt.Println("error generating token: ", err)
		return fmt.Errorf("error generating token: %v", err)
	}
	incomingEvent.Token = token
	createdUser, err := CreateUser(incomingEvent.CreateUserAdminReq, incomingEvent.Token, baseUrl)
	if err != nil {
		fmt.Println("error creating user: ", err)
		return fmt.Errorf("error creating user: %v", err)
	}
	log.Debug(fmt.Sprintf("created user sub: %v ", createdUser))
	return nil
}

func CreateUser(userInfo CreateUserAdminRequest, accessToken, baseUrl string) (*DataCreateUserAdmin, error) {
	requestBody, err := json.Marshal(userInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal userinfo  body: %v", err)
	}
	fmt.Println("request body: ", userInfo)
	// Create a new HTTP request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/users-srv/user/create/admin", baseUrl), bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create update user request: %v", err)
	}
	// Set the content type header
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
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
		return nil, fmt.Errorf("failed to read create user response body: %v", err)
	}

	// Parse the response JSON
	var userInfoResponse CreateUserAdminResponse
	err = json.Unmarshal(body, &userInfoResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal userInfo response body: %v", err)
	}
	if userInfoResponse.Status != 200 {
		return nil, fmt.Errorf("failed to update userInfo response status: %v", userInfoResponse.Status)

	}
	//fmt.Println("UserInfoResponse:", userInfoResponse)
	return &userInfoResponse.Data, nil
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

type Event struct {
	Sub                string
	Processed          bool
	Token              string
	UserInfo           *UserInfo
	CreateUserAdminReq CreateUserAdminRequest
}

type CreateUserAdminRequest struct {
	PrimaryType string                `json:"primaryType"`
	UserEntity  CreateUserInfoRequest `json:"userEntity"`
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Error       string `json:"error"`
}

type CreateUserAdminResponse struct {
	Data    DataCreateUserAdmin `json:"data"`
	Status  int64               `json:"status"`
	Success bool                `json:"success"`
}

type DataCreateUserAdmin struct {
	Sub     string `json:"sub"`
	Created bool   `json:"created"`
}

type CreateUserInfoRequest struct {
	Sub      string `json:"sub"`
	Email    string `json:"email"`
	Provider string `json:"provider"`
}

type UserInfo struct {
	LastUsedIdentityID string            `json:"last_used_identity_id"`
	Sub                string            `json:"sub"`
	UpdatedAt          time.Time         `json:"updated_at"`
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
