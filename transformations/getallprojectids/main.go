package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"github.com/zinscky/log"
)

type ProjectResponse struct {
	Data struct {
		List []Project `json:"list"`
	} `json:"data"`
}

type Project struct {
	ID                  string         `json:"id"`
	Active              bool           `json:"active"`
	CreatedTime         string         `json:"createdTime"`
	UpdatedTime         string         `json:"updatedTime"`
	FeatureControlTags  []string       `json:"featureControlTags"`
	ContextPaths        []string       `json:"contextPaths"`
	CidaasMajorVersions []int          `json:"cidaasMajorVersions"`
	ReqEnvVars          []string       `json:"reqEnvVars"`
	Seeding             bool           `json:"seeding"`
	SeedOrder           int            `json:"seedOrder"`
	ConcurrencyPolicy   string         `json:"concurrencyPolicy"`
	ExposedPublicly     bool           `json:"exposedPublicly"`
	Resource            Resource       `json:"resource"`
	SeedData            interface{}    `json:"seedData"`
	DockerRepo          string         `json:"dockerRepo"`
	ServiceName         string         `json:"serviceName"`
	DeploymentRule      DeploymentRule `json:"deploymentRule"`
	ServiceType         string         `json:"serviceType"`
	Language            string         `json:"language"`
	ProjectID           string         `json:"projectId"`
	ReplicaSet          ReplicaSet     `json:"replicaSet"`
	HealthCheck         HealthCheck    `json:"healthCheck"`
}

type Resource struct {
	CPUMin string `json:"cpuMin"`
	CPUMax string `json:"cpuMax"`
	MemMin string `json:"memMin"`
	MemMax string `json:"memMax"`
}

type DeploymentRule struct {
	AllowedRuntime []string    `json:"allowedRuntime"`
	RedirectRule   interface{} `json:"redirectRule"`
	IsRedirect     bool        `json:"isRedirect"`
}

type ReplicaSet struct {
	Min int `json:"min"`
	Max int `json:"max"`
}

type HealthCheck struct {
	Enabled  bool   `json:"enabled"`
	EndPoint string `json:"endPoint"`
}

type MyEvent struct {
	ProjectIds       []string `json:"projectIds"`
	ProjectSize 	 int      `json:"projectSize"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	// unmarshal incoming event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return "", err
	}
	// apply your transformation logic
	var allProjects []string
	u, err := url.Parse(config["cmiBaseURL"])
	if err != nil {
		fmt.Printf("Invalid base URL: %v", err)
	}

	q := u.Query()
	q.Set("skip", config["skip"])
	q.Set("limit", config["limit"])
	u.RawQuery = q.Encode()

	finalURL := u.String()	
	log.Info(finalURL)
	req, err := http.NewRequest("GET", finalURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", config["cmiToken"])

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("request error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var response ProjectResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("error decoding JSON: %w", err)
	}

	for _, p := range response.Data.List {
		allProjects = append(allProjects, p.ProjectID)
	}
	myEvent.ProjectIds = allProjects
	myEvent.ProjectSize = len(allProjects)
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}
