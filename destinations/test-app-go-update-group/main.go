
package main

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
	fmt.Println("incoming Event: ", incomingEvent)
	token, err := GenerateToken(baseUrl, clientId, clientSecret)
	if err != nil {
		//fmt.Println("error generating token: ", err)
		return nil, fmt.Errorf("error generating token: %v", err)
	}
	incomingEvent.Token = token
	resp, err := UpdateGroup(incomingEvent.GroupInfo, incomingEvent.Token, baseUrl)
	if err != nil {
		log.Debug(fmt.Sprintf("error updating group: %v ", err))
		return nil, fmt.Errorf("error updating group: %v", err)
	}
	log.Debug(fmt.Sprintf("update group response: %v ", resp))
	return vars, nil
}

func UpdateGroup(request GroupRequest, token, baseUrl string) (*GroupResponse, error) {
	requestBody, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal groupInfo  body: %v", err)
	}
	apiURL, _ := url.JoinPath(baseUrl, "groups-srv", "usergroups")
	req, err := http.NewRequest("PUT", apiURL, bytes.NewBuffer(requestBody))
	if err != nil {
		fmt.Println("Error creating request:", err)
		return nil, errors.Errorf("error creating request %s - error %s", apiURL, err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making create group request:", err)
		return nil, errors.Errorf("error making create group request %s - error %s", apiURL, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		fmt.Println("response bodycode: ", resp.StatusCode)
		return nil, errors.Errorf("non success status from api %s - status code is %s", apiURL, resp.Status)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return nil, errors.Errorf("error reading response body %s - error %s", apiURL, err)
	}
	var groupResponse UpdateGroupResponse
	err = json.Unmarshal(body, &groupResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal userInfo response body: %v", err)
	}
	return &groupResponse.Data, nil

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

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Error       string `json:"error"`
}

type Event struct {
	Sub       string
	Processed bool
	Token     string
	GroupInfo GroupRequest
}

type GroupRequest struct {
	GroupID      string `json:"groupId,omitempty"`
	GroupName    string `json:"groupName,omitempty"`
	Description  string `json:"description,omitempty"`
	CustomFields struct {
	} `json:"customFields,omitempty"`
	MemberProfileVisibility     string `json:"memberProfileVisibility,omitempty"`
	NoneMemberProfileVisibility string `json:"noneMemberProfileVisibility,omitempty"`
	ParentID                    string `json:"parentId,omitempty"`
	GroupOwner                  string `json:"groupOwner,omitempty"`
}

type GroupResponse struct {
	ID                          string    `json:"_id"`
	GroupID                     string    `json:"groupId"`
	GroupType                   string    `json:"groupType"`
	GroupName                   string    `json:"groupName"`
	ClassName                   string    `json:"className"`
	ParentID                    string    `json:"parentId"`
	Path                        string    `json:"path"`
	GroupOwner                  string    `json:"groupOwner"`
	MakeFirstUserAdmin          bool      `json:"make_first_user_admin"`
	UpdatedTime                 time.Time `json:"updatedTime"`
	CreatedTime                 time.Time `json:"createdTime"`
	MemberProfileVisibility     string    `json:"memberProfileVisibility"`
	NoneMemberProfileVisibility string    `json:"noneMemberProfileVisibility"`
}

type UpdateGroupResponse struct {
	Data    GroupResponse `json:"data"`
	Status  int64         `json:"status"`
	Success bool          `json:"success"`
}
