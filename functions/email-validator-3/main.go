// main.go
package handler

import (
    "encoding/json"
    "regexp"
    "strings"

    "github.com/gofiber/fiber/v2"
    "github.com/zinscky/log"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2}$`)

// HandleRequest processes an incoming HTTP request to validate an email address.
func HandleRequest(ctx *fiber.Ctx) error {
    LOG := log.NewLogger(ctx, log.Debug)
    bodyBytes := ctx.Body()
    hasEmailField := strings.Contains(string(bodyBytes), "\"email\"")
    LOG.Info("function entry", "payloadSize", len(bodyBytes), "hasEmailField", hasEmailField)

    // Parse JSON body
    var req struct {
        Email string `json:"email"`
    }
    if err := json.Unmarshal(bodyBytes, &req); err != nil {
        snippet := string(bodyBytes)
        if len(snippet) > 100 {
            snippet = snippet[:100]
        }
        LOG.Error("failed to parse JSON body", "error", err.Error(), "bodySnippet", snippet)
        errResp := map[string]string{"error": "invalid JSON payload"}
        respBytes, _ := json.Marshal(errResp)
        ctx.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSON)
        LOG.Info("response ready", "status", fiber.StatusBadRequest, "outputSize", len(respBytes), "success", false)
        return ctx.Status(fiber.StatusBadRequest).Send(respBytes)
    }

    trimmedEmail := strings.TrimSpace(req.Email)
    if trimmedEmail == "" {
        LOG.Error("missing email field", "email", req.Email)
        errResp := map[string]string{"error": "missing required field: email"}
        respBytes, _ := json.Marshal(errResp)
        ctx.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSON)
        LOG.Info("response ready", "status", fiber.StatusBadRequest, "outputSize", len(respBytes), "success", false)
        return ctx.Status(fiber.StatusBadRequest).Send(respBytes)
    }

    LOG.Info("email extracted", "email", trimmedEmail)

    isValid := emailRegex.MatchString(trimmedEmail)
    message := "invalid email format"
    if isValid {
        message = "valid email format"
    }

    resp := map[string]interface{}{
        "email":   trimmedEmail,
        "message": message,
        "valid":   isValid,
    }
    respBytes, _ := json.Marshal(resp)
    LOG.Info("email validation completed", "email", trimmedEmail, "valid", isValid)

    ctx.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSON)
    LOG.Info("response ready", "status", fiber.StatusOK, "outputSize", len(respBytes), "success", true, "valid", isValid)
    return ctx.Status(fiber.StatusOK).Send(respBytes)
}
