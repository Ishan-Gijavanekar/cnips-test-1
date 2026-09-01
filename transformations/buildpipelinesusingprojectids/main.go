package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/zinscky/log"
)

type MyEvent struct {
	ServiceNames []string `json:"serviceNames"`
	ProjectIds   []int    `json:"projectIds"`
}

func triggerPipeline(projectId int, branchName, gitlabBaseURL, gitlabToken string) error {
	apiURL := fmt.Sprintf("%s/projects/%d/pipeline", gitlabBaseURL, projectId)
	payload := map[string]string{
		"ref": branchName,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return err
	}

	req.Header.Set("PRIVATE-TOKEN", gitlabToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to trigger pipeline (status %d): %s", resp.StatusCode, string(body))
	}

	fmt.Printf("Pipeline triggered successfully for project %d on branch '%s'", projectId, branchName)
	return nil
}

func checkWhichBranchExists(projectId int, gitlabBaseURL, gitlabToken string, branchNames []string) (string, error) {
	for _, branchName := range branchNames {
		url := fmt.Sprintf("%s/projects/%d/repository/branches/%s", gitlabBaseURL, projectId, url.PathEscape(branchName))

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return "", err
		}
		req.Header.Set("PRIVATE-TOKEN", gitlabToken)

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return "", err
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			return branchName, nil
		}
		if resp.StatusCode != http.StatusNotFound {
			var errResp map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&errResp)
			return "", fmt.Errorf("error checking branch %s: %v", branchName, errResp)
		}
	}

	return "", fmt.Errorf("no matching branch found from: %v", branchNames)
}

func triggerPipelineOnFirstExistingBranch(projectId int, gitlabBaseURL, gitlabToken string, branchCandidates []string) error {
	branch, err := checkWhichBranchExists(projectId, gitlabBaseURL, gitlabToken, branchCandidates)
	if err != nil {
		return fmt.Errorf("could not find a matching branch: %w", err)
	}
	err = triggerPipeline(projectId, branch, gitlabBaseURL, gitlabToken)
	if err != nil {
		return fmt.Errorf("failed to trigger pipeline on branch '%s': %w", branch, err)
	}

	return nil
}

func triggerForMultipleProjects(projectIDs []int, gitlabBaseURL, gitlabToken string, branchCandidates []string) error {
	var wg sync.WaitGroup
	errs := make(chan error, len(projectIDs))

	for _, projectID := range projectIDs {
		wg.Add(1)

		go func(pid int) {
			defer wg.Done()
			err := triggerPipelineOnFirstExistingBranch(pid, gitlabBaseURL, gitlabToken, branchCandidates)
			if err != nil {
				errs <- fmt.Errorf("project %d: %w", pid, err)
			}
		}(projectID)
	}

	wg.Wait()
	close(errs)

	if len(errs) > 0 {
		return <-errs
	}
	return nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside transformation")
	// unmarshal incoming event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return "", err
	}
	// apply your transformation logic
	gBaseURL := config["gitlabBaseURL"]
	gToken := config["gitlabToken"]
	branchesString := config["branchNames"]
	branches := strings.Split(branchesString, ",")
	error := triggerForMultipleProjects(myEvent.ProjectIds,gBaseURL,gToken,branches)
	if error != nil {
		return "", error
	}
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}
