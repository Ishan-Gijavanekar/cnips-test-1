
package handler

import (
	"github.com/zinscky/log"
	"github.com/pkg/errors"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"fmt"
)

func Setup(config map[string]string, log *log.Logger) error { /* optional */
        //setup connection
	return nil
}

func Teardown(config map[string]string, log *log.Logger) error {/* optional */
        //teardown connection
	return nil
}

func Execute1(event string, config map[string]string, vars map[string]string, log *log.Logger) (map[string]string, error) {/* required */
        //send to destination.
	return vars, nil
}

func GenerateToken(baseUrl, clientId, clientSecret string) (string, error) {
	tokenReq := url.Values{
		"client_id":     []string{clientId},
		"client_secret": []string{clientSecret},
		"grant_type":    []string{"client_credentials"},
	}
	tokenURL, _ := url.JoinPath(baseUrl, "token-srv", "token")
	//resp, err := httpclient.PostForm(tokenURL, tokenReq)
	resp, err := http.PostForm(tokenURL, tokenReq)
	if err != nil {
		return "", err
	}
	if resp.StatusCode != http.StatusOK {
		return "", errors.Errorf("non success status code from token api - status code is (%s)", resp.Status)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		//fmt.Println("error parsing response body for api:", err)
		return "", errors.Errorf("error parsing response body for api %s - (%v)", tokenURL, err)
	}
	var tokenResponse TokenResponse
	err = json.Unmarshal(body, &tokenResponse)
	if err != nil {
		return "", errors.Errorf("error unmarshalling response body for api %s - (%v)", tokenURL, err)

	}
	return tokenResponse.AccessToken, nil
}

func Execute(
	event string,
	config map[string]string,
	vars map[string]string,
	log *log.Logger,
) (map[string]string, error) {
	baseUrl := config["base_url"]
	clientId := config["client_id"]
	clientSecret := config["client_secret"]
	log.Debug("")
	//1. Unmarshal Incoming event
	var incomingEvent Event
	err := json.Unmarshal([]byte(event), &incomingEvent)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal incoming event body: %v", err)
	}
	log.Debug("incomingEvent: ", incomingEvent)
	token, err := GenerateToken(baseUrl, clientId, clientSecret)
	if err != nil {
		fmt.Println("Error generating token: ", err)
		return nil, fmt.Errorf("error generating token: %v", err)
	}
	incomingEvent.Token = token
	_, err = DeleteUser(baseUrl, incomingEvent.Sub, token)
	if err != nil {
		return nil, fmt.Errorf("error deleting user: %v", err)
	}
	return vars, nil

}

func DeleteUser(baseURL, sub, token string) (string, error) {
	apiURL, _ := url.JoinPath(baseURL, "users-srv", "user", "purge", sub)
	req, err := http.NewRequest("DELETE", apiURL, nil)
	if err != nil {
		fmt.Println("Error creating request:", err)
		return "", errors.Errorf("error creating request %s - error %s", apiURL, err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	// Create an HTTP client
	client := &http.Client{}

	// Send the request
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making request:", err)
		return "", errors.Errorf("error making request %s - error %s", apiURL, err)

	}
	defer resp.Body.Close()
	if resp.StatusCode != 202 {
		fmt.Println("response bodycode: ", resp.StatusCode)
		return "", errors.Errorf("non success status from api %s - status code is %s", apiURL, resp.Status)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return "", errors.Errorf("error reading response body %s - error %s", apiURL, err)
	}
	//fmt.Println("response body: ", string(body))
	return string(body), nil
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Error       string `json:"error"`
}

type Event struct {
	Sub       string
	Processed bool
	Token     string
}
