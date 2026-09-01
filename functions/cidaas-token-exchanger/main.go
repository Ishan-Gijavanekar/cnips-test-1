// main.go
package handler

import (
    "encoding/json"
    "io"
    "net/http"
    "net/url"
    "strings"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/zinscky/log"
)

func HandleRequest(ctx *fiber.Ctx) error {
    LOG := log.NewLogger(ctx, log.Debug)
    LOG.Info("request received", "requestId", ctx.Get("X-Request-ID"), "payloadSize", len(ctx.Body()), "contentType", ctx.Get("Content-Type"))

    configRaw := ctx.Locals("config")
    if configRaw == nil {
        LOG.Error("missing config in context")
        return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  "error",
            "message": "configuration not provided",
        })
    }
    config, ok := configRaw.(map[string]string)
    if !ok {
        LOG.Error("invalid config type", "actualType", configRaw)
        return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  "error",
            "message": "configuration invalid",
        })
    }

    varsRaw := ctx.Locals("vars")
    varsMap, ok := varsRaw.(map[string]string)
    if !ok || varsRaw == nil {
        varsMap = map[string]string{}
    }

    tokenEndpoint := config["tokenendpoint"]
    clientID := config["clientid"]
    redirectURIConfig := config["redirecturi"]
    timeoutStr := config["timeout"]
    if timeoutStr == "" {
        timeoutStr = "30"
    }

    LOG.Info("config loaded", "hasTokenEndpoint", tokenEndpoint != "", "hasClientId", clientID != "", "hasRedirectUri", redirectURIConfig != "", "timeoutSeconds", timeoutStr)
    LOG.Info("vars loaded", "varsPresent", len(varsMap) > 0)

    if tokenEndpoint == "" || clientID == "" || redirectURIConfig == "" {
        LOG.Error("required config missing", "hasTokenEndpoint", tokenEndpoint != "", "hasClientId", clientID != "", "hasRedirectUri", redirectURIConfig != "")
        return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  "error",
            "message": "required configuration values are missing",
        })
    }

    type requestPayload struct {
        Code         string `json:"code"`
        CodeVerifier string `json:"code_verifier"`
        RedirectURI  string `json:"redirect_uri"`
    }

    var payload requestPayload
    if err := json.Unmarshal(ctx.Body(), &payload); err != nil {
        preview := string(ctx.Body())
        if len(preview) > 200 {
            preview = preview[:200]
        }
        LOG.Error("json unmarshal failed", "error", err.Error(), "inputPreview", preview)
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "status":  "error",
            "message": "invalid JSON payload",
        })
    }

    if payload.Code == "" || payload.CodeVerifier == "" {
        LOG.Error("missing required fields", "hasCode", payload.Code != "", "hasCodeVerifier", payload.CodeVerifier != "")
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "status":  "error",
            "message": "code and code_verifier are required",
        })
    }

    redirectURI := payload.RedirectURI
    if redirectURI == "" {
        redirectURI = redirectURIConfig
    }
    if redirectURI == "" {
        LOG.Error("redirect uri missing")
        return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "status":  "error",
            "message": "redirect_uri is required",
        })
    }

    timeoutSec, err := time.ParseDuration(timeoutStr + "s")
    if err != nil {
        LOG.Error("invalid timeout config", "timeout", timeoutStr, "error", err.Error())
        return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  "error",
            "message": "invalid timeout configuration",
        })
    }

    form := url.Values{}
    form.Set("grant_type", "authorization_code")
    form.Set("code", payload.Code)
    form.Set("redirect_uri", redirectURI)
    form.Set("client_id", clientID)
    form.Set("code_verifier", payload.CodeVerifier)

    client := &http.Client{Timeout: timeoutSec}
    req, err := http.NewRequestWithContext(ctx.Context(), http.MethodPost, tokenEndpoint, strings.NewReader(form.Encode()))
    if err != nil {
        LOG.Error("failed to create http request", "error", err.Error(), "url", tokenEndpoint)
        return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  "error",
            "message": "failed to create request",
        })
    }
    req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

    LOG.Info("calling external api", "url", tokenEndpoint, "method", http.MethodPost)
    start := time.Now()
    resp, err := client.Do(req)
    latency := time.Since(start)
    if err != nil {
        LOG.Error("api call failed", "error", err.Error(), "url", tokenEndpoint, "latencyMs", latency.Milliseconds())
        return ctx.Status(fiber.StatusBadGateway).JSON(fiber.Map{
            "status":  "error",
            "message": "failed to call token endpoint",
        })
    }
    defer resp.Body.Close()

    bodyBytes, err := io.ReadAll(resp.Body)
    if err != nil {
        LOG.Error("failed to read response", "error", err.Error(), "statusCode", resp.StatusCode)
        return ctx.Status(fiber.StatusBadGateway).JSON(fiber.Map{
            "status":  "error",
            "message": "failed to read token response",
        })
    }
    LOG.Info("api response received", "statusCode", resp.StatusCode, "bodySize", len(bodyBytes), "latencyMs", latency.Milliseconds())

    if resp.StatusCode < 200 || resp.StatusCode >= 300 {
        var errResp map[string]interface{}
        if jsonErr := json.Unmarshal(bodyBytes, &errResp); jsonErr != nil {
            LOG.Error("api error response unmarshal failed", "error", jsonErr.Error(), "statusCode", resp.StatusCode)
            return ctx.Status(resp.StatusCode).JSON(fiber.Map{
                "status":  "error",
                "message": "token endpoint returned an error",
            })
        }
        LOG.Error("token endpoint returned error", "statusCode", resp.StatusCode, "response", errResp)
        return ctx.Status(resp.StatusCode).JSON(fiber.Map{
            "status":  "error",
            "message": errResp,
        })
    }

    var tokenData map[string]interface{}
    if err := json.Unmarshal(bodyBytes, &tokenData); err != nil {
        preview := string(bodyBytes)
        if len(preview) > 200 {
            preview = preview[:200]
        }
        LOG.Error("token response unmarshal failed", "error", err.Error(), "responsePreview", preview)
        return ctx.Status(fiber.StatusBadGateway).JSON(fiber.Map{
            "status":  "error",
            "message": "invalid token response format",
        })
    }

    response := fiber.Map{
        "status":         "success",
        "token_response": tokenData,
    }

    respBytes, err := json.Marshal(response)
    if err != nil {
        LOG.Error("failed to marshal response", "error", err.Error())
        return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  "error",
            "message": "failed to build response",
        })
    }

    LOG.Info("function complete", "outputSize", len(respBytes), "status", "success")
    ctx.Set("Content-Type", "application/json")
    return ctx.Status(fiber.StatusOK).Send(respBytes)
}
