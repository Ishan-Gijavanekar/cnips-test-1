package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/zinscky/log"
)

// aiAgentOutput is the outer envelope produced by the AI Conversational Agent component.
type aiAgentOutput struct {
	Response  string `json:"response"`
	ToolsUsed bool   `json:"tools_used"`
	Success   bool   `json:"success"`
	Error     string `json:"error"`
}

// LLMResponse is the expected JSON structure from the LLM.
type LLMResponse struct {
	ProjectID  int    `json:"project_id"`
	IssueIID   int    `json:"issue_iid"`
	AuthorID   int    `json:"author_id"`
	AuthorName string `json:"author_name"`
	Title      string `json:"title"`
	Response   string `json:"response"`
}

// Config keys:
//   GITLAB_TOKEN    - project/personal access token with api scope
//   GITLAB_BASE_URL - (optional) defaults to https://gitlab.widas.de

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) error {
	log.Info("processing LLM response for gitlab comment")

	llmJSON, err := extractLLMJSON(event)
	if err != nil {
		log.Error("failed to extract LLM JSON: " + err.Error())
		return fmt.Errorf("extract LLM JSON: %w", err)
	}

	cleaned, err := cleanLLMJSON(llmJSON)
	if err != nil {
		log.Error("failed to clean LLM JSON: " + err.Error())
		return fmt.Errorf("clean LLM JSON: %w", err)
	}

	var resp LLMResponse
	if err := json.Unmarshal([]byte(cleaned), &resp); err != nil {
		log.Error("failed to parse LLM response: " + err.Error())
		return fmt.Errorf("parse LLM response: %w", err)
	}

	if resp.ProjectID == 0 || resp.IssueIID == 0 {
		log.Error("missing project_id or issue_iid in LLM response")
		return fmt.Errorf("missing project_id or issue_iid in LLM response")
	}

	if strings.TrimSpace(resp.Response) == "" {
		log.Error("empty response field in LLM response")
		return fmt.Errorf("empty response field in LLM response")
	}

	comment := "<!-- bot-response -->\n" + resp.Response

	gitlabToken := config["GITLAB_TOKEN"]
	if gitlabToken == "" {
		log.Error("GITLAB_TOKEN not set in config")
		return fmt.Errorf("GITLAB_TOKEN not set in config")
	}

	baseURL := config["GITLAB_BASE_URL"]
	if baseURL == "" {
		baseURL = "https://gitlab.widas.de"
	}

	log.Info(fmt.Sprintf("posting comment to project %d issue #%d", resp.ProjectID, resp.IssueIID))

	if err := postComment(baseURL, gitlabToken, resp.ProjectID, resp.IssueIID, comment); err != nil {
		log.Error("failed to post gitlab comment: " + err.Error())
		return fmt.Errorf("post gitlab comment: %w", err)
	}

	log.Info(fmt.Sprintf("successfully posted comment to project %d issue #%d", resp.ProjectID, resp.IssueIID))
	return nil
}

// extractLLMJSON unwraps the AI agent output envelope.
// The event can arrive in two forms:
//  1. Wrapped: {"response": "{...}", "success": true, ...}  — the inner "response" is a stringified JSON from the LLM.
//  2. Direct: the raw LLM JSON string (already the LLMResponse).
func extractLLMJSON(event string) (string, error) {
	var outer aiAgentOutput
	if err := json.Unmarshal([]byte(event), &outer); err != nil {
		return "", fmt.Errorf("unmarshal event: %w", err)
	}

	// If the outer envelope has a "response" string that itself looks like JSON,
	// treat it as the wrapped format from the AI Conversational Agent.
	if outer.Response != "" && strings.ContainsAny(outer.Response, "{}") {
		if !outer.Success {
			return "", fmt.Errorf("AI agent reported failure: %s", outer.Error)
		}
		return outer.Response, nil
	}

	// Otherwise assume the event itself is the LLM response.
	return event, nil
}

// cleanLLMJSON strips markdown fences and extracts the first valid JSON object.
func cleanLLMJSON(raw string) (string, error) {
	s := strings.TrimSpace(raw)

	if strings.HasPrefix(s, "```") {
		idx := strings.Index(s, "\n")
		if idx != -1 {
			s = s[idx+1:]
		}
		if last := strings.LastIndex(s, "```"); last != -1 {
			s = s[:last]
		}
		s = strings.TrimSpace(s)
	}

	start := strings.Index(s, "{")
	end := strings.LastIndex(s, "}")
	if start == -1 || end == -1 || end <= start {
		return "", fmt.Errorf("no JSON object found in LLM output")
	}
	s = s[start : end+1]

	var check json.RawMessage
	if err := json.Unmarshal([]byte(s), &check); err != nil {
		return "", fmt.Errorf("extracted text is not valid JSON: %w", err)
	}

	return s, nil
}

func postComment(baseURL, token string, projectID, issueIID int, body string) error {
	url := fmt.Sprintf("%s/api/v4/projects/%d/issues/%d/notes", baseURL, projectID, issueIID)

	payload, err := json.Marshal(map[string]string{"body": body})
	if err != nil {
		return fmt.Errorf("marshal comment: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("PRIVATE-TOKEN", token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("gitlab API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}
