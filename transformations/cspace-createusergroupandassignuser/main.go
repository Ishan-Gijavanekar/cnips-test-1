package handler

import (
	"encoding/json"
	"fmt"
	"errors"
	"net/http"
	"bytes"
	"github.com/zinscky/log"
)

type UserGroup struct {
	GroupId                 string      `json:"groupId"`
	GroupName               string      `json:"groupName"`
	GroupType               string      `json:"groupType"`
	ParentId                string      `json:"parentId"`
	Description             string      `json:"description"`
	MakeFirstUserAdmin      bool        `json:"makeFirstUserAdmin"`
	MemberProfileVisibility string      `json:"memberProfileVisibility"`
	User                    []GroupUser `json:"User"`
}

type GroupUser struct {
	Sub   string   `json:"sub"`
	Roles []string `json:"roles"`
}

func createUserGroupAndAssignUser(payload UserGroup, token string, config map[string]string, log *log.Logger) error {
	url := config["cidaasBaseURL"] + "/groups-srv/usergroups"
	method := "POST"
	client := &http.Client{}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("Failed to marshal payload. Reason: %v", err)
	}
	payloadReader := bytes.NewReader(payloadBytes)
	req, err := http.NewRequest(method, url, payloadReader)
	if err != nil {
		return fmt.Errorf("Failed building request for userGroup creation. Reason: %v", err)
	}
	req.Header.Add("Authorization", "Bearer " + token)
	req.Header.Add("Content-Type", "application/json")
	res, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("Failed to send http request for userGroup creation. Reason: %v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated{
		return fmt.Errorf("Unexpected response status during userGroup creation. ResponseStatus: %v", res.StatusCode)
	}
	return nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside transformation")
	// unmarshal incoming event to your struct
	myEvent := map[string]interface{}{}
	err := json.Unmarshal([]byte(event), &myEvent)
	if err != nil {
		return "", err
	}
	// checks if userGroupPayload is present in event
	rawPayload, ok := myEvent["userGroupPayload"]
	if !ok {
		return "", errors.New("userGroupPayload field is missing in event")
	}
	if rawPayload == nil {
		return "", errors.New("userGroupPayload field is nil in event")
	}
	// apply your transformation logic
	unmarshal := func(v interface{}, target interface{}) error {
		b, err := json.Marshal(v)
		if err != nil {
			return err
		}
		return json.Unmarshal(b, target)
	}
	// unmarshal cidaas user
	var userGroupPayload UserGroup
	if err := unmarshal(myEvent["userGroupPayload"], &userGroupPayload); err != nil {
		return "", fmt.Errorf("Failed to unmarshal userGroupPayload from event. Error: %+v", err)
	}
	token := myEvent["cidaasToken"].(string)
	err = createUserGroupAndAssignUser(userGroupPayload, token,config, log)
	if err != nil {
		return "", fmt.Errorf("Failed to create user group and assign user. Error: %+v", err)
	}
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}
