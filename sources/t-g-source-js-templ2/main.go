package handler

import (
	"encoding/json"

	"github.com/zinscky/log"
)

// Define your struct to model the extracted data
type MyEvent struct {
	Sub       string `json:"sub"`
	CharCount int    `json:"charCount"`
}

func Execute(config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("incoming config %v", config)
	// your logic for data extraction
	//extracted data must always be returned as array
	data := []MyEvent{
		{Sub: "abc"},
		{Sub: "abcd"},
	}
	// marshal you data in to json
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}
