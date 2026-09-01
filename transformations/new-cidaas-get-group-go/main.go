package handler

import (
	"encoding/json"
	"fmt"
	"github.com/pkg/errors"
	"github.com/zinscky/log"
	"io"
	"net/http"
	"net/url"
	"time"
)

// this can be defined by you based
// on your event structure

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

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger)  (string, error) {
	baseUrl := config["base_url"]
	clientId := config["client_id"]
	clientSecret := config["client_secret"]
	log.Debug("")
	//1. Unmarshal Incoming event
	var incomingEvent Event
	err := json.Unmarshal([]byte(event), &incomingEvent)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal incoming event body: %v", err)
	}
	log.Debug("incomingEvent: ", incomingEvent)
	token, err := GenerateToken(baseUrl, clientId, clientSecret)
	if err != nil {
		return "", fmt.Errorf("error generating token: %v", err)
	}
	incomingEvent.Token = token
	groupResponse, err := GetGroupInfo(baseUrl, incomingEvent.GroupId, incomingEvent.Token)
	if err != nil {
		return "", fmt.Errorf("error getting group: %v", err)
	}
	destinationEvent := DestinationEvent{
		AccessToken: token,
		GroupInfo:   *groupResponse,
		GroupId:     incomingEvent.GroupId,
	}
	jsonData, err := json.Marshal(destinationEvent)
	if err != nil {
		log.Debug("Error marshaling UserInfo response to JSON: %v", err)
	}
	log.Debug(fmt.Sprintf("read group response: %v ", string(jsonData)))
	return string(jsonData), nil
}

func GetGroupInfo(baseURL, groupId, token string) (*GroupResponse, error) {
	apiURL, _ := url.JoinPath(baseURL, "groups-srv", "usergroups", groupId)
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		fmt.Println("Error creating read group request:", err)
		return nil, errors.Errorf("error creating read group request %s - error %s", apiURL, err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	// Create an HTTP client
	client := &http.Client{}

	// Send the request
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Errorf("error making read group request %s - error %s", apiURL, err)
	}
	defer resp.Body.Close()
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != 200 {
		return nil, errors.Errorf("non success status from api %s - status code is %s", apiURL, resp.Status)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("error parsing read group response body for api:", err)
		return nil, errors.Errorf("error parsing read group response body for api %s - (%v)", apiURL, err)
	}
	var groupResponse GroupResponse
	err = json.Unmarshal(body, &groupResponse)
	if err != nil {
		return nil, errors.Errorf("error unmarshalling response body for api %s - (%v)", apiURL, err)
	}
	return &groupResponse, nil
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
	GroupId   string
	Processed bool
	Token     string
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

type DestinationEvent struct {
	AccessToken string        `json:"access_token,omitempty"`
	GroupInfo   GroupResponse `json:"userInfo,omitempty"`
	GroupId     string        `json:"sub,omitempty"`
}
