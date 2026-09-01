package handler

import (
    "encoding/json"
    "fmt"
    "strings"

    "github.com/zinscky/log"
)

type MyEvent struct {
    Sub       string `json:"sub"`
    CharCount int    `json:"charCount"`
}

// Execute receives a processed event, validates it, and simulates delivery to a destination.
// It writes a JSON object with a top-level "results" field to stdout so that callers can
// assert delivery, and returns an error if anything goes wrong.
func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) error {
    log.Info("inside destination")

    // basic validation for empty payloads
    if strings.TrimSpace(event) == "" {
        err := fmt.Errorf("empty event payload")
        log.Error(err.Error())
        return err
    }

    // unmarshal incoming event into a generic map to preserve all fields
    var payload map[string]interface{}
    if err := json.Unmarshal([]byte(event), &payload); err != nil {
        log.Error(fmt.Sprintf("failed to parse event: %v", err))
        return err
    }

    // prepare the delivery result object
    result := map[string]interface{}{
        "results": map[string]interface{}{
            "delivered": true,
            "event":     payload,
        },
    }

    // marshal the result for output
    encoded, err := json.Marshal(result)
    if err != nil {
        log.Error(fmt.Sprintf("failed to marshal results: %v", err))
        return err
    }

    // output the result so tests can validate the presence of the "results" field
    fmt.Println(string(encoded))
    log.Info("delivery complete")
    return nil
}
