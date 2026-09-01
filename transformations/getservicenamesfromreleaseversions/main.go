package handler

import (
	"encoding/json"
	"fmt"
	"io"

	// "log"
	"net/http"
	"time"

	"github.com/zinscky/log"
)

type ServiceResponse struct {
	Success bool `json:"success"`
	Status  int  `json:"status"`
	Data    struct {
		Count int       `json:"count"`
		List  []Service `json:"list"`
	} `json:"data"`
}

type Service struct {
	ID                  string                    `json:"id"`
	Active              bool                      `json:"active"`
	CreatedTime         string                    `json:"createdTime"`
	UpdatedTime         string                    `json:"updatedTime"`
	FeatureControlTags  []string                  `json:"featureControlTags"`
	ContextPaths        []string                  `json:"contextPaths"`
	CidaasMajorVersions []int                     `json:"cidaasMajorVersions"`
	ReqEnvVars          []string                  `json:"reqEnvVars"`
	Seeding             bool                      `json:"seeding"`
	SeedOrder           int                       `json:"seedOrder"`
	ConcurrencyPolicy   string                    `json:"concurrencyPolicy"`
	ExposedPublicly     bool                      `json:"exposedPublicly"`
	Resource            Resource                  `json:"resource"`
	SeedData            interface{}               `json:"seedData"`
	DockerRepo          string                    `json:"dockerRepo"`
	ServiceName         string                    `json:"serviceName"`
	DeploymentRule      DeploymentRule            `json:"deploymentRule"`
	ServiceType         string                    `json:"serviceType"`
	Language            string                    `json:"language"`
	ProjectID           string                    `json:"projectId"`
	ReplicaSet          ReplicaSet                `json:"replicaSet"`
	HealthCheck         HealthCheck               `json:"healthCheck"`
	CidaasVersion       string                    `json:"cidaasVersion"`
	ServiceVersion      string                    `json:"serviceVersion"`
	MajorVersion        int                       `json:"majorVersion"`
	ReleasedOn          string                    `json:"releasedOn"`
	ScalingInfo         map[string]ScalingDetails `json:"scalingInfo"`
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

type ScalingDetails struct {
	Metrics     []ScalingMetric `json:"metrics"`
	MinCPU      string          `json:"minCPU"`
	MaxCPU      float64         `json:"maxCPU"`
	MinRAM      string          `json:"minRAM"`
	MaxRAM      string          `json:"maxRAM"`
	MinReplicas int             `json:"minReplicas"`
	MaxReplicas int             `json:"maxReplicas"`
	Description string          `json:"description"`
}

type ScalingMetric struct {
	Type     string `json:"type"`
	Resource struct {
		Name   string `json:"name"`
		Target struct {
			Type         string `json:"type"`
			AverageValue string `json:"averageValue"`
		} `json:"target"`
	} `json:"resource"`
}

type MyEvent struct {
	ServiceNames []string `json:"serviceNames"`
}

func getServiceNamesFromReleaseVersion(cmiBaseURL, cmiToken, releaseVersion string) ([]string, error) {
	// Validate input parameters
	if cmiBaseURL == "" || cmiToken == "" || releaseVersion == "" {
		return nil, fmt.Errorf("missing required parameters: cmiBaseURL, cmiToken, or releaseVersion")
	}

	url := fmt.Sprintf("%s/admin/release/version/serviceconfigs/%s", cmiBaseURL, releaseVersion)

	// Create a client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", cmiToken)

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request error: %w", err)
	}
	defer resp.Body.Close()

	// Read body once
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var response ServiceResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("error decoding JSON: %w", err)
	}

	// Pre-allocate slice with capacity
	allProjects := make([]string, 0, len(response.Data.List))
	for _, p := range response.Data.List {
		allProjects = append(allProjects, p.ServiceName)
	}

	return allProjects, nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	// Validate required config parameters
	log.Info("Inside Transformation")
	requiredParams := []string{"cmiBaseURL", "cmiToken", "releaseVersion"}
	for _, param := range requiredParams {
		if config[param] == "" {
			return "", fmt.Errorf("missing required config parameter: %s", param)
		}
	}

	// Log the execution start
	log.Info("Starting service names retrieval for release version: %s", config["releaseVersion"])

	// Unmarshal incoming event
	var myEvent MyEvent
	if err := json.Unmarshal([]byte(event), &myEvent); err != nil {
		return "", fmt.Errorf("failed to unmarshal event: %w", err)
	}

	// Apply transformation logic
	names, err := getServiceNamesFromReleaseVersion(
		config["cmiBaseURL"],
		config["cmiToken"],
		config["releaseVersion"],
	)
	if err != nil {
		log.Error("Error retrieving service names: %v", err)
		return "", err
	}

	// Update the event with service names
	myEvent.ServiceNames = names

	// Marshal the event back to JSON
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", fmt.Errorf("failed to marshal transformed event: %w", err)
	}

	log.Info("Successfully retrieved %d service names", len(names))
	return string(transformedEvent), nil
}
