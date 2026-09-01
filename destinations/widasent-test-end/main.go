package handler

import (
	"encoding/json"
	"fmt"
	"github.com/zinscky/log"
)

type CidaasUserInfo struct{
	Sub string `json:"sub"`
	UserStatus string `json:"userStatus"`
	Email string `json:"email"`
	GivenName string `json:"given_name"`
	FamilyName string `json:"family_name"`
	Roles []string `json:"roles"`
	Groups []UserGroups `json:"groups"`
}

type UserGroups struct {
	Sub string `json:"sub"`
	GroupID string `json:"groupId"`
	Roles []string `json:"roles"`
	GroupType string `json:"groupType"`
	GroupName string `json"groupName"`
	Path string `json:"path"`
}

//func extractUserinfoFromSub(sub string, config map[string]string, log *log.Logger) (cidaasUser, error){
//	url := config["cidaasBaseURL"] + "users-srv/userinfo/" + sub
//}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) error {
	log.Info(fmt.Sprintf("Incomming event string: %+v", event))
	// unmarshal incoming event to your struct
	// send to destination
	//log.Info(fmt.Sprintf("EVENT: %+v", myEvent))
	//log.Info(fmt.Sprintf("EVENT STRING: %+v", myEvent))
	return nil
}
