package handler

import (
	"errors"
	"fmt"

	"github.com/zinscky/log"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type EmailConfig struct {
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Body    string   `json:"body"`
}

// emailFrom and sendGridAPIKey should be configured in the config
// To, Subject, Body should be configured in the emailConfig
func Execute(event string, emailConfig *EmailConfig, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside approval")

	emailFrom := config["email_from"]
	apiKey := config["sendgrid_api_key"]

	if emailFrom == "" || apiKey == "" {
		return "", fmt.Errorf("missing configuration: 'email_from' and 'sendgrid_api_key' are required")
	}

	if len(emailConfig.To) == 0 {
		return "", fmt.Errorf("no recipient found in approval configuration")
	}

	from := mail.NewEmail("Sender", emailFrom)
	message := mail.NewV3Mail()

	p := mail.NewPersonalization()
	for _, recipient := range emailConfig.To {
		p.AddTos(mail.NewEmail("", recipient))
	}
	message.AddPersonalizations(p)

	message.SetFrom(from)
	message.Subject = emailConfig.Subject

	content := mail.NewContent("text/html", emailConfig.Body)
	message.AddContent(content)

	client := sendgrid.NewSendClient(apiKey)
	response, err := client.Send(message)
	if err != nil {
		log.Error("error sending email: %v", err)
		return "", fmt.Errorf("sendgrid send failed: %w", err)
	}

	if response.StatusCode >= 200 && response.StatusCode < 300 {
		log.Info("Email sent successfully to: %v", emailConfig.To)
		return event, nil
	}

	errMsg := fmt.Sprintf("email failed with status %d: %s", response.StatusCode, response.Body)
	log.Error(errMsg)
	return "", errors.New(errMsg)
}
