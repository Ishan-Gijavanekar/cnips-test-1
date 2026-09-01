// main.go
package handler

import (
    "encoding/json"
    "regexp"
    "strings"

    "github.com/gofiber/fiber/v2"
    "github.com/zinscky/log"
)

func HandleRequest(ctx *fiber.Ctx) error {
    LOG := log.NewLogger(ctx, log.Debug)
    payload := ctx.Body()
    LOG.Info("executing email validation", "payloadSize", len(payload), "requestId", ctx.Get("X-Request-ID"))

    // Retrieve config from context locals if available
    cfg := map[string]string{}
    if rawCfg := ctx.Locals("config"); rawCfg != nil {
        if castCfg, ok := rawCfg.(map[string]string); ok {
            cfg = castCfg
        } else {
            LOG.Error("config type assertion failed", "error", "config not map[string]string")
        }
    }

    pattern := cfg["emailpattern"]
    LOG.Info("config loaded", "emailpatternPresent", pattern != "", "configProvided", len(cfg) > 0)

    if strings.TrimSpace(pattern) == "" {
        pattern = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2}$"
        LOG.Info("using default email pattern", "emailpatternPresent", false)
    }

    compiledPattern, err := regexp.Compile(pattern)
    if err != nil {
        LOG.Error("regex compile failed", "error", err.Error(), "pattern", pattern)
        return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "invalid email pattern configuration"})
    }

    type request struct {
        Email interface{} `json:"email"`
    }

    var req request
    if err := json.Unmarshal(payload, &req); err != nil {
        preview := string(payload)
        if len(preview) > 200 {
            preview = preview[:200]
        }
        LOG.Error("json unmarshal failed", "error", err.Error(), "inputPreview", preview)
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid JSON payload"})
    }

    emailStr, ok := req.Email.(string)
    if !ok {
        LOG.Error("email field type invalid", "error", "email must be string")
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email must be a string"})
    }

    emailStr = strings.TrimSpace(emailStr)
    if emailStr == "" {
        LOG.Error("email field missing or empty", "error", "email is required")
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email is required"})
    }

    isValid := compiledPattern.MatchString(emailStr)
    message := "email is valid"
    if !isValid {
        message = "email is invalid"
    }

    response := fiber.Map{
        "valid":   isValid,
        "message": message,
    }

    respBytes, err := json.Marshal(response)
    if err != nil {
        LOG.Error("json marshal failed", "error", err.Error())
        return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to marshal response"})
    }

    LOG.Info("function complete", "outputSize", len(respBytes), "valid", isValid)
    return ctx.Status(fiber.StatusOK).JSON(response)
}
