package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"fmt"
	"io"
	"github.com/zinscky/log"
)

type MyEvent struct {
	EventType   string    `json:"eventtype"`
	Sub         string    `json:"sub"`
	ClientId    string    `json:"client_id"`
	TenantKey   string    `json:"tenantKey"`
	UserId      string    `json:"userId"`
	ActorId     string    `json:"actorId"`
	UserInfo    *UserInfo `json:"userInfo"`
	CidaasToken string    `json:"cidaasToken"`
}

type UserInfo struct {
	Sub        string       `json:"sub"`
	UserStatus string       `json:"userStatus"`
	Email      string       `json:"email"`
	GivenName  string       `json:"given_name"`
	FamilyName string       `json:"family_name"`
	Roles      []string     `json:"roles"`
	Groups     []UserGroups `json:"groups"`
}

type UserGroups struct {
	Sub       string   `json:"sub"`
	GroupID   string   `json:"groupId"`
	Roles     []string `json:"roles"`
	GroupType string   `json:"groupType"`
	GroupName string   `json"groupName"`
	Path      string   `json:"path"`
}

func GetUserInfoBySub(sub, token string, config map[string]string, log *log.Logger) (*UserInfo, error) {
	url := config["cidaasBaseURL"] + "/users-srv/userinfo/" + sub
	method := "GET"
	// Building requests
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Failed to build request to get user info. Error: %+v", err))
	}
	client := &http.Client{}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	// sending request
	log.Info(fmt.Sprintf("REQUEST: %+v", req))
	res, err := client.Do(req)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Failed to send https request. Error: %+v", err))
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, errors.New(fmt.Sprintf("Unexpected response status. Response: %+v with Request: %+v", res, req))
	}
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Error reading response body. Error: %+v", err))
	}
	var userInfo UserInfo
	err = json.Unmarshal(body, &userInfo)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Error unmarshalling response body. Error: %+v", err))
	}
	log.Info(fmt.Sprintf("Extracted user info: %+v", userInfo))
	return &userInfo, nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	
	log.Info("inside transformation with event: "+ event)
	// unmarshal incoming event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return "", err
	}
	// apply your transformation logic
	log.Info(fmt.Sprintf("Extracted Sub: %+v", myEvent.Sub))
	//token := myEvent.CidaasToken
	token := myEvent.CidaasToken
	userInfo, err := GetUserInfoBySub(myEvent.Sub, token, config, log)
	if err != nil {
		return "", err
	}
	myEvent.UserInfo = userInfo
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}