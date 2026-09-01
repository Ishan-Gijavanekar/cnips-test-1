package handler

import (
	"encoding/json"
	"bytes"
	"fmt"
	"net/http"
	"github.com/zinscky/log"
)

func UpdateGitlabIdFromCidaasUser(cidaasSub string, hubspotId string, token string, config map[string]string, log *log.Logger) error {
	if cidaasSub == "" || hubspotId == "" {
		return fmt.Errorf("Could not update gitlabId ffor cidaas because of missing cidaasSub : `%+v` or gitlabid: `%+v`.", cidaasSub, hubspotId)
	}
	url := config["cidaasBaseURL"] + "/user-srv/users/" + cidaasSub
	method := "PUT"
	client := &http.Client{}
	payload := map[string]interface{}{
		"userData": map[string]string{
			"provider": "self",
		},
		"customFields": map[string]string{
			"hubspotContactId": hubspotId,
		},
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("Error marshalling the playload to update gitlabid for cidaas user. Error: %+v", err)
	}
	payloadReader := bytes.NewReader(payloadBytes)
	req, err := http.NewRequest(method, url, payloadReader)
	if err != nil {
		return fmt.Errorf("Error building request for updating gitlabid for cidaas user. Error: %+v", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+token)
	res, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("Could not update gitlabid for cidaas user. Error: %+v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("Unexpected response status while updating gitlabid for cidaas user. Response: %+v", res)
	}
	return nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) error {
	log.Info("Inside transformation with incomming event: " + event)

	// unmarshal incoming event to your struct
	myEvent := map[string]interface{}{}
	err := json.Unmarshal([]byte(event), &myEvent)
	if err != nil {
		return err
	}
	// apply your transformation logic
	sub := myEvent["cidaasUser"].(map[string]interface{})["sub"].(string)
	hubspotId := myEvent["contact"].(map[string]interface{})["id"].(string)

	token := myEvent["cidaasToken"].(string)
	err = UpdateGitlabIdFromCidaasUser(sub, hubspotId, token, config, log)
	if err != nil {
		return err
	}
	return nil
}
