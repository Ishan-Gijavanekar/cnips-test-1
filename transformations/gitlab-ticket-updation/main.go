package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/zinscky/log"
)

type MyEvent struct {
	ActorID                 string                  `json:"actorId"`
	ClientID                string                  `json:"client_id"`
	CreatedTime             string                  `json:"createTime"`
	EventType               string                  `json:"eventtype"`
	MetaData                map[string]interface{}  `json:"metaData"`
	ObjectID                string                  `json:"objectId"`
	ObjectType              string                  `json:"objectType"`
	Sub                     string                  `json:"sub"`
	TenantKey               string                  `json:"tenantKey"`
	UserID                  string                  `json:"userId"`
	ErrorMsg                string                  `json:"errorMsg"`
	CidaasVersion           string                  `json:"cidaasVersion,omitempty"`
	WebhookAttributes       []WebhookAttribute      `json:"webhookAttributes,omitempty"`
	GitlabEventOverviewInfo GitlabEventOverviewInfo `json:"gitlabEventOverviewInfo,omitempty"`
	GitlabUpdateRequest     GitlabUpdateRequest     `json:"gitlabUpdateRequest,omitempty"`
}

type GitlabEventOverviewInfo struct {
	IssueID   int `json:"issueId,omitempty"`
	ProjectId int `json:"projectId,omitempty"`
}

type WebhookAttribute struct {
	ID                string   `json:"_id"`
	GoodForWebhook    bool     `json:"goodForWebhook"`
	RelatedAttributes []string `json:"relatedAttributes"`
}

type GitlabUpdateRequest struct {
	Description string `json:"description"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside transformation")

	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return "", err
	}

	// Update OverviewTable Description for issues in GitLab
	err = UpdateOverviewTableDescriprtion(myEvent, config, log)
	if err != nil {
		log.Error("updates the GitLab issue description failed: %v", err)
		return "", err
	}

	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	log.Info("transformedEvent", string(transformedEvent))
	return string(transformedEvent), nil
}

// UpdateOverviewTableDescription updates the GitLab issue description using the GitLab API
func UpdateOverviewTableDescriprtion(event *MyEvent, config map[string]string, log *log.Logger) error {

	if event.GitlabEventOverviewInfo.IssueID == 0 || event.GitlabEventOverviewInfo.ProjectId == 0 {
		return fmt.Errorf("missing GitLab issue or project ID")
	}

	gitlabToken := config["gitlabToken"]
	gitlabBaseURL := config["gitlabBaseUrl"]
	updateURL := fmt.Sprintf("%s/projects/%d/issues/%d", gitlabBaseURL, event.GitlabEventOverviewInfo.ProjectId,event.GitlabEventOverviewInfo.IssueID )


	log.Info("Requesting GitLab updateURL API: %s", updateURL)

	log.Info("Description : ",event.GitlabUpdateRequest.Description)
	
	requestBody, err := json.Marshal(map[string]string{
		"description": event.GitlabUpdateRequest.Description,
	})
	if err != nil {
		log.Error("Failed to marshal request body: %v", err)
		return err
	}

	req, err := http.NewRequest("PUT", updateURL, bytes.NewBuffer(requestBody))
	if err != nil {
		log.Error("Failed to create HTTP request: %v", err)
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("PRIVATE-TOKEN", gitlabToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error("HTTP request failed: %v", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to update GitLab issue: %s", resp.Status)
	}

	log.Info("GitLab issue updated successfully")
	return nil
}
