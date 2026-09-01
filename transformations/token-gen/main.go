package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/innacy/table"
	"github.com/zinscky/log"
)

var (
	// Reusable HTTP client with timeout
	httpClient = &http.Client{
		Timeout: 30 * time.Second,
	}
)

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	baseUrl := strings.TrimSpace(strings.TrimSuffix(config["cidaas_base_url"], "/"))
	tableBaseUrl := strings.TrimSpace(strings.TrimSuffix(config["table_base_url"], "/"))
	tableId := config["tableId"]

	ctx := context.Background()
	tableAccessor := table.NewCnipsTableAccessor[map[string]any](tableBaseUrl, config["tableApiKey"])

	// Check for existing token
	allRows, err := tableAccessor.Find(ctx, tableId, nil)
	if err != nil {
		log.Error("Error finding rows: %v", err)
		return "", fmt.Errorf("error finding rows: %v", err)
	}

	if len(allRows) > 0 {
		accessToken, ok := allRows[0]["access_token"].(string)
		if !ok || accessToken == "" {
			log.Info("Existing token is invalid format, generating new token")
		} else {
			valid, err := ValidateToken(baseUrl, accessToken)
			if err != nil {
				log.Error("Error validating token: %v", err)
				return "", fmt.Errorf("error validating token: %v", err)
			}
			if valid {
				log.Info("Existing token is valid, returning it")
				return sendResponse(accessToken, true)
			}
			log.Info("Existing token is invalid, generating new token")
		}
	}

	// Generate new token
	token, err := GenerateToken(baseUrl, config["client_id"], config["client_secret"])
	if err != nil {
		log.Error("Error generating token: %v", err)
		return "", fmt.Errorf("error generating token: %v", err)
	}

	// Save token to table
	row := map[string]any{"access_token": token}
	oldAccessToken, ok := allRows[0]["access_token"].(string)
	if ok && oldAccessToken != "" {
		// Update existing row
		query := map[string]any{"access_token": oldAccessToken}
		if _, err = tableAccessor.Update(ctx, tableId, query, &row); err != nil {
			log.Error("Error updating token: %v", err)
			return "", fmt.Errorf("error updating token: %v", err)
		}
	} else {
		// Insert new row
		if err = tableAccessor.Insert(ctx, tableId, &row); err != nil {
			log.Error("Error inserting token: %v", err)
			return "", fmt.Errorf("error inserting token: %v", err)
		}
	}

	log.Info("New token generated and saved")
	return sendResponse(token, true)
}

func ValidateToken(baseUrl, accessToken string) (bool, error) {
	if baseUrl == "" || accessToken == "" {
		return false, fmt.Errorf("baseUrl and accessToken cannot be empty")
	}

	tokenURL, err := url.JoinPath(baseUrl, "token-srv", "introspect")
	if err != nil {
		return false, fmt.Errorf("invalid baseUrl: %w", err)
	}

	tokenReq := url.Values{
		"token":           []string{accessToken},
		"token_type_hint": []string{"access_token"},
	}

	resp, err := httpClient.PostForm(tokenURL, tokenReq)
	if err != nil {
		return false, fmt.Errorf("failed to validate token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("token validation failed with status: %s", resp.Status)
	}

	var response struct {
		Active bool `json:"active"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return false, fmt.Errorf("failed to decode validation response: %w", err)
	}

	return response.Active, nil
}

func GenerateToken(baseUrl, clientId, clientSecret string) (string, error) {
	if baseUrl == "" || clientId == "" || clientSecret == "" {
		return "", fmt.Errorf("baseUrl, clientId, and clientSecret cannot be empty")
	}

	tokenURL, err := url.JoinPath(baseUrl, "token-srv", "token")
	if err != nil {
		return "", fmt.Errorf("invalid baseUrl: %w", err)
	}

	tokenReq := url.Values{
		"client_id":     []string{clientId},
		"client_secret": []string{clientSecret},
		"grant_type":    []string{"client_credentials"},
	}

	resp, err := httpClient.PostForm(tokenURL, tokenReq)
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("token generation failed with status: %s", resp.Status)
	}

	var tokenResponse TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return "", fmt.Errorf("failed to decode token response: %w", err)
	}

	if tokenResponse.Error != "" {
		return "", fmt.Errorf("token generation error: %s", tokenResponse.Error)
	}

	return tokenResponse.AccessToken, nil
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Error       string `json:"error"`
}

type Response struct {
	AccessToken string `json:"access_token"`
	Valid       bool   `json:"valid"`
}

func sendResponse(token string, valid bool) (string, error) {
	response := Response{
		AccessToken: token,
		Valid:       valid,
	}
	responseJson, err := json.Marshal(response)
	if err != nil {
		return "", fmt.Errorf("error marshalling response: %w", err)
	}
	return string(responseJson), nil
}
