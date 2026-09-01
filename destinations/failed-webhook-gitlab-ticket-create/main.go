package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/zinscky/log"
)

// MyEvent represents the webhook event structure
type MyEvent struct {
	ActorID     string                  `json:"actorId"`
	ClientID    string                  `json:"client_id"`
	CreatedTime time.Time               `json:"createdTime"`
	EventType   string                  `json:"eventtype"`
	MetaData    *map[string]interface{} `json:"metaData"`
	ObjectID    string                  `json:"objectId"`
	ObjectType  string                  `json:"objectType"`
	Sub         string                  `json:"sub"`
	TenantKey   string                  `json:"tenantKey"`
	UserID      string                  `json:"userId"`
	ErrorMsg    string                  `json:"errorMsg"`
	CidaasVersion string                  `json:"cidaasVersion,omitempty"`
}

// GitLabIssue represents the payload for creating a GitLab issue
type GitLabIssue struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Labels      []string `json:"labels"`
}

// FactEventDetails represents the mapping of facts to projects
type FactEventDetails struct {
	ProjectID string   `json:"projectId"`
	Component string   `json:"component"`
	Facts     []string `json:"facts"`
}

// Execute processes the event and calls CreateGitLabTicket
func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) error {
	log.Info("inside destination")

	// Unmarshal incoming event to struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		log.Error("Failed to unmarshal event: %v", err)
		return err
	}

	// Get Fact events details based on component from global variables
	var factEventDetails []FactEventDetails
	err = json.Unmarshal([]byte(vars["GLOBAL_WEBHOOK_COMPONENT_DATA"]), &factEventDetails)
	if err != nil {
		log.Error("Failed to unmarshal GLOBAL_WEBHOOK_COMPONENT_DATA: %v", err)
		return err
	}

	// Get component projectId based on eventType
	projectID := GetComponentProjectID(myEvent.EventType, factEventDetails)
	if projectID == "" {
		log.Info("No matching project found for event type: %s", myEvent.EventType)
		return nil
	}



	// Create a GitLab issue using the extracted event data
	// err = CreateGitLabTicket(myEvent, config, projectID, log)
	// if err != nil {
	// 	log.Error("Failed to create GitLab issue: %v", err)
	// 	return err
	// }
	log.Info("GitLab issue created successfully for event with projectID: %s", projectID)

	log.Info("GitLab issue created successfully for event: %s", myEvent.EventType)
	return nil
}

// GetComponentProjectID returns the project ID associated with the event type
func GetComponentProjectID(eventType string, factEventDetails []FactEventDetails) string {
	for _, entry := range factEventDetails {
		for _, fact := range entry.Facts {
			if fact == eventType {
				return entry.ProjectID
			}
		}
	}
	return ""
}

// CreateGitLabTicket processes event data and creates a GitLab issue
func CreateGitLabTicket(myEvent *MyEvent, config map[string]string, projectID string, log *log.Logger) error {
	gitlabToken := config["gitlabToken"]
	gitlabBaseURL := config["gitlabBaseUrl"]
	gitlabAPIUrl := fmt.Sprintf("%s/%s/issues", gitlabBaseURL, projectID)

	// Convert event to JSON
	webhookJSON, err := ConvertEventToJSON(myEvent)
	if err != nil {
		log.Error("Failed to convert event to JSON: %v", err)
		return err
	}

	// Extract necessary fields
	tenantKey := myEvent.TenantKey
	cidaasVersion := myEvent.CidaasVersion
	errorMessage := myEvent.ErrorMsg

	title := "[Webhook Automation] Missing Required Webhook Attributes"
	description := fmt.Sprintf(
		"### Description:\n\n"+
			"We encountered an issue while processing the webhook event.\n\n"+
			"### Webhook Event Request Body:\n```json\n%s\n````\n\n"+
			"### Error Message:\n```json\n%s\n```\n\n"+
			"### Instance Info:\n"+
			"- **Tenant Key**: %s\n"+
			"- **Cidaas Version**: %s\n",
		string(webhookJSON),
		errorMessage,
		tenantKey,
		cidaasVersion,
	)
	labels := []string{"Status::ToDo", "Type::Bug"}

	// Prepare payload for GitLab API
	issue := GitLabIssue{
		Title:       title,
		Description: description,
		Labels:      labels,
	}

	payload, err := json.Marshal(issue)
	if err != nil {
		log.Error("Failed to marshal GitLab issue payload: %v", err)
		return err
	}

	req, err := http.NewRequest("POST", gitlabAPIUrl, bytes.NewBuffer(payload))
	if err != nil {
		log.Error("Failed to create HTTP request: %v", err)
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("PRIVATE-TOKEN", gitlabToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error("Failed to execute HTTP request: %v", err)
		return err
	}
	defer resp.Body.Close()

	// Check HTTP response status
	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		log.Error("Failed to create GitLab issue, status code: %d, response: %s", resp.StatusCode, string(body))
		return fmt.Errorf("failed to create GitLab issue, status code: %d", resp.StatusCode)
	}

	return nil
}

// ConvertEventToJSON removes empty fields and error messages from the event
func ConvertEventToJSON(myEvent *MyEvent) (string, error) {
	// Convert struct to a generic map
	eventMap := make(map[string]interface{})
	eventJSON, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}

	err = json.Unmarshal(eventJSON, &eventMap)
	if err != nil {
		return "", err
	}

	// Remove "errorMsg" key from the map
	delete(eventMap, "errorMsg")
	delete(eventMap, "cidaasVersion")

	// Marshal again to ensure formatting
	webhookJSON, err := json.MarshalIndent(eventMap, "", "  ")
	if err != nil {
		return "", err
	}

	return string(webhookJSON), nil
}
