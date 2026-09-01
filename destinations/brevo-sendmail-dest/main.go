package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"github.com/zinscky/log"
	"strconv"
)

func Setup(config map[string]string, log *log.Logger) error { /* optional */
	//setup connection
	return nil
}

func Teardown(config map[string]string, log *log.Logger) error { /* optional */
	//teardown connection
	return nil
}

func Execute(config map[string]string, event string, vars map[string]string, log *log.Logger) (map[string]string, error) {
	if config["BREVO_API_KEY"] == "" || config["TEMPLATE_ID"] == "" {
		return nil, errors.New("API key or TEMPLATE_ID is required")
	}

	var sendMailEvent BrevoSendMailEvent

	// Unmarshal the JSON string into the struct
	//fmt.Println("JSON Data: ", event)
	err := json.Unmarshal([]byte(event), &sendMailEvent)
	if err != nil {
		//fmt.Println("Error unmarshalling JSON:", err)
		return nil, errors.New(fmt.Sprintf("error unmarshalling event %v", err))
	}
	url := "https://api.sendinblue.com/v3/smtp/email"
	templateId, err := strconv.ParseInt(config["TEMPLATE_ID"], 10, 64)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("error parsing templateId %v ", err))
	}
	payload := map[string]interface{}{
		"to":         sendMailEvent.To,
		"templateId": templateId,
		"params":     sendMailEvent.Params,
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return nil, errors.New(fmt.Sprintf("error marshalling payload for send mail %v", err))
	}

	// Create the HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, errors.New(fmt.Sprintf("error creating send mail request %v", err))
	}

	// Set the required headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", config["BREVO_API_KEY"])

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return nil, errors.New(fmt.Sprintf("error sending request %v", err))
	}
	defer resp.Body.Close()

	// Check the response
	if resp.StatusCode == http.StatusCreated {
		fmt.Println("Email sent successfully!")
		jsonData, err := json.Marshal(resp.Body)
		if err != nil {
			fmt.Println("error sending brevo mail ", err)

			return nil, errors.New(fmt.Sprintf("error marshalling  response %v", err))
		}
		//sendMailEvent.Response = string(jsonData)
		// logger.Info(fmt.Sprintf("sent email response: %v", string(jsonData)))
		fmt.Println("Resp Body!! ", string(jsonData))
		return nil, nil
	} else {
		return nil, errors.New(fmt.Sprintf("failed to send email. Status code: %d\n", resp.StatusCode))
		//fmt.Printf("Failed to send email. Status code: %d\n", resp.StatusCode)
	}
	return nil, nil
}

type BrevoSendMailEvent struct {
	Sender      []map[string]string `json:"sender,omitempty"`
	To          []map[string]string `json:"to"`
	Subject     string              `json:"subject,omitempty"`
	HtmlContent string              `json:"htmlContent,omitempty"`
	Response    string              `json:"response,omitempty"`
	Params      Params `json:"params,omitempty"`
}

type Params struct {
	Action string              `json:"action,omitempty"`
}