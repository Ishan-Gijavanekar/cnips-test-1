package handler

import (
	"encoding/json"
	"fmt"
	"errors"
	"github.com/google/uuid"
	"github.com/zinscky/log"
)

type CidaasUser struct {
	Sub           string            `json:"sub"`
	UserStatus    string            `json:"userStatus"`
	CustomFields  map[string]interface{} `json:"customFields"`
	Email         string            `json:"email"`
	EmailVerified bool              `json:"email_verified"`
	GivenName     string            `json:"given_name"`
	FamilyName    string            `json:"family_name"`
	MobileNumber  string            `json:"mobile_number"`
}

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

func createUserGroupPayload(user *CidaasUser) (UserGroup, error) {
	userGroup := UserGroup{
		GroupId:                 uuid.New().String(),
		GroupName:               user.CustomFields["company_name"].(string),
		GroupType:               "cidaas-customer-grouptype",
		ParentId:                "cidaas-customer",
		Description:             fmt.Sprintf("Customer group %s", user.CustomFields["company_name"].(string)),
		MakeFirstUserAdmin:      true,
		MemberProfileVisibility: "full",
		User: []GroupUser{{
			Sub: user.Sub,
			Roles: []string{
				"GROUP_ADMIN",
				"TECHNICAL_ADMIN",
				"TICKET_REPORTER",
				"CONTACT",
				"MEMBER_INVITER",
				"MEMBER_ADDER",
			},
		}},
	}
	return userGroup, nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside transformation with incomming event:" + event)
	// unmarshal incoming event to your struct
	myEvent := map[string]interface{}{}
	err := json.Unmarshal([]byte(event), &myEvent)
	if err != nil {
		return "", err
	}
	// apply your transformation logic
	// define function to unmarshal event objects
	rawUser, ok := myEvent["cidaasUser"]
	if !ok {
		return "", errors.New("cidaasUser field is missing in event")
	}
	if rawUser == nil {
		return "", errors.New("cidaasUser field is nil in event")
	}
	unmarshal := func(v interface{}, target interface{}) error {
		b, err := json.Marshal(v)
		if err != nil {
			return err
		}
		return json.Unmarshal(b, target)
	}
	// unmarshal cidaas user
	var cidaasUser CidaasUser
	if err := unmarshal(myEvent["cidaasUser"], &cidaasUser); err != nil {
		return "", fmt.Errorf("Failed to unmarshal cidaas user entity from event. Error: %+v", err)
	}
	payload, err := createUserGroupPayload(&cidaasUser)
	if err != nil {
		return "", fmt.Errorf("Failed to create payload. Error: %v", err)
	}
	myEvent["userGroupPayload"] = payload
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}
