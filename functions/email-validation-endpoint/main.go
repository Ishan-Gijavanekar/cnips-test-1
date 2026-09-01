// main.go
package handler

import (
    "encoding/json"
    "regexp"
    "strings"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/zinscky/log"
)

type validationRequest struct {
    Email   string `json:"email"`
    Pattern string `json:"pattern"`
}

type validationResponse struct {
    Email   string `json:"email"`
    Message string `json:"message"`
    Pattern string `json:"pattern"`
    Valid   bool   `json:"valid"`
}

func defaultEmailPattern() string {
    return "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2}$"
}

func HandleRequest(ctx *fiber.Ctx) error {
    start := time.Now()
    LOG := log.NewLogger(ctx, log.Debug)

    rawBody := ctx.Body()
    bodySnippet := string(rawBody)
    if len(bodySnippet) > 200 {
        bodySnippet = bodySnippet[:200]
    }
    LOG.Info("function entry", "payloadSize", len(rawBody), "bodySnippet", bodySnippet)

    if len(rawBody) == 0 {
        LOG.Error("empty request body", "payloadSize", 0)
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "empty request body"})
    }

    var req validationRequest
    if err := json.Unmarshal(rawBody, &req); err != nil {
        LOG.Error("failed to parse request body", "error", err.Error(), "bodySnippet", bodySnippet)
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid JSON payload"})
    }

    email := strings.TrimSpace(req.Email)
    if email == "" {
        LOG.Error("missing or empty email field", "bodySnippet", bodySnippet)
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email is required"})
    }

    pattern := strings.TrimSpace(req.Pattern)
    patternSource := "request"
    if pattern == "" {
        pattern = defaultEmailPattern()
        patternSource = "default"
    }
    LOG.Info("selected pattern", "source", patternSource, "patternLength", len(pattern))

    compiled, err := regexp.Compile(pattern)
    if err != nil {
        LOG.Error("failed to compile regex", "error", err.Error(), "patternSource", patternSource)
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid pattern"})
    }

    LOG.Info("running validation", "emailLength", len(email))
    isValid := compiled.MatchString(email)
    message := "email is invalid"
    if isValid {
        message = "email is valid"
    }

    resp := validationResponse{
        Email:   email,
        Message: message,
        Pattern: pattern,
        Valid:   isValid,
    }

    respBytes, err := json.Marshal(resp)
    if err != nil {
        LOG.Error("failed to marshal response", "error", err.Error(), "email", email)
        return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to prepare response"})
    }

    LOG.Info("response ready", "outputSize", len(respBytes), "valid", isValid, "latencyMs", time.Since(start).Milliseconds())
    return ctx.Status(fiber.StatusOK).JSON(resp)
}
