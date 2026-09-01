// main.go
package handler

import (
    "encoding/json"

    "github.com/gofiber/fiber/v2"
    "github.com/zinscky/log"
)

type Response struct {
    Status  string      `json:"status"`
    Message string      `json:"message"`
    Data    interface{} `json:"data"`
}

func HandleRequest(ctx *fiber.Ctx) error {
    LOG := log.NewLogger(ctx, log.Debug)

    body := ctx.Body()
    payloadSize := len(body)
    contentType := ctx.Get("Content-Type")
    requestID := ctx.Get("X-Request-ID")
    LOG.Info("Function entry", "payloadSize", payloadSize, "contentType", contentType, "requestID", requestID)

    // No config or vars available in this signature
    LOG.Info("Config/VARS access", "configPresent", false, "varsPresent", false)

    var payload map[string]interface{}
    if payloadSize > 0 {
        if err := json.Unmarshal(body, &payload); err != nil {
            LOG.Error("Failed to parse JSON body", "error", err.Error(), "payloadSnippet", string(body))
            resp := Response{Status: "error", Message: "Invalid JSON payload", Data: nil}
            respBytes, _ := json.Marshal(resp)
            LOG.Info("Returning error response", "statusCode", fiber.StatusBadRequest, "responseSize", len(respBytes), "requestID", requestID)
            return ctx.Status(fiber.StatusBadRequest).JSON(resp)
        }
        LOG.Info("JSON parsed successfully", "fieldCount", len(payload))
    } else {
        payload = map[string]interface{}{}
        LOG.Info("No payload provided, using empty object")
    }

    resp := Response{Status: "success", Message: "Request processed successfully", Data: payload}
    respBytes, marshalErr := json.Marshal(resp)
    if marshalErr != nil {
        LOG.Error("Failed to marshal response", "error", marshalErr.Error())
        errResp := Response{Status: "error", Message: "Internal server error", Data: nil}
        errBytes, _ := json.Marshal(errResp)
        LOG.Info("Returning marshal error", "statusCode", fiber.StatusInternalServerError, "responseSize", len(errBytes), "requestID", requestID)
        return ctx.Status(fiber.StatusInternalServerError).JSON(errResp)
    }

    LOG.Info("Returning success response", "statusCode", fiber.StatusOK, "responseSize", len(respBytes), "requestID", requestID, "dataFieldCount", len(payload))
    return ctx.Status(fiber.StatusOK).JSON(resp)
}
