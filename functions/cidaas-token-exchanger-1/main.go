// main.go
package handler

import (
    "encoding/json"
    "io"
    "net/http"
    "net/url"
    "strconv"
    "strings"
    "time"

    "github.com/zinscky/log"
)

// HandleRequest processes an OAuth2 authorization code exchange against a Cidaas token endpoint.
func HandleRequest(w http.ResponseWriter, r *http.Request) {
    logger := log.NewLogger(r, log.Info)
    logger.Info("request received", "payloadSize", r.ContentLength)

    w.Header().Set("Content-Type", "application/json")

    bodyBytes, err := io.ReadAll(io.LimitReader(r.Body, 1048576))
    if err != nil {
        logger.Error("failed reading request body", "error", err.Error())
        writeError(w, http.StatusBadRequest, "unable to read request body")
        return
    }

    logger.Info("payload loaded", "payloadSize", len(bodyBytes))

    var incoming struct {
        Config       map[string]string `json:"config"`
        Code         string            `json:"code"`
        CodeVerifier string            `json:"code_verifier"`
        RedirectURI  string            `json:"redirect_uri"`
        ClientID     string            `json:"client_id"`
    }

    if err := json.Unmarshal(bodyBytes, &incoming); err != nil {
        logger.Error("json unmarshal failed", "error", err.Error(), "inputPreview", preview(bodyBytes))
        writeError(w, http.StatusBadRequest, "invalid JSON payload")
        return
    }

    config := map[string]string{
        "tokenurl":     "",
        "clientid":     "",
        "redirecturi":  "",
        "timeout":      "30",
    }

    if incoming.Config != nil {
        for k, v := range incoming.Config {
            config[k] = v
        }
    }

    if strings.TrimSpace(incoming.ClientID) != "" {
        config["clientid"] = incoming.ClientID
    }
    if strings.TrimSpace(incoming.RedirectURI) != "" {
        config["redirecturi"] = incoming.RedirectURI
    }

    logger.Info("config loaded", "tokenurlPresent", strings.TrimSpace(config["tokenurl"]) != "", "clientidPresent", strings.TrimSpace(config["clientid"]) != "", "redirecturiPresent", strings.TrimSpace(config["redirecturi"]) != "", "timeoutConfigured", strings.TrimSpace(config["timeout"]) != "")

    tokenURL := strings.TrimSpace(config["tokenurl"])
    if tokenURL == "" {
        logger.Error("missing configuration", "field", "tokenurl")
        writeError(w, http.StatusBadRequest, "missing config: tokenurl")
        return
    }

    clientID := strings.TrimSpace(config["clientid"])
    if clientID == "" {
        logger.Error("missing configuration", "field", "clientid")
        writeError(w, http.StatusBadRequest, "missing config: clientid")
        return
    }

    redirectURI := strings.TrimSpace(config["redirecturi"])
    if redirectURI == "" {
        logger.Error("missing configuration", "field", "redirecturi")
        writeError(w, http.StatusBadRequest, "missing config: redirecturi")
        return
    }

    code := strings.TrimSpace(incoming.Code)
    if code == "" {
        logger.Error("missing required field", "field", "code")
        writeError(w, http.StatusBadRequest, "missing field: code")
        return
    }

    timeout := 30 * time.Second
    if strings.TrimSpace(config["timeout"]) != "" {
        tVal, err := strconv.Atoi(strings.TrimSpace(config["timeout"]))
        if err != nil || tVal <= 0 {
            logger.Error("invalid timeout configuration", "value", config["timeout"], "error", func() string { if err != nil { return err.Error() } return "non-positive" }())
        } else {
            timeout = time.Duration(tVal) * time.Second
        }
    }

    form := url.Values{}
    form.Set("grant_type", "authorization_code")
    form.Set("code", code)
    form.Set("client_id", clientID)
    form.Set("redirect_uri", redirectURI)
    if strings.TrimSpace(incoming.CodeVerifier) != "" {
        form.Set("code_verifier", strings.TrimSpace(incoming.CodeVerifier))
    }

    logger.Info("calling external api", "url", tokenURL, "method", "POST", "hasCodeVerifier", strings.TrimSpace(incoming.CodeVerifier) != "")

    client := &http.Client{Timeout: timeout}
    req, err := http.NewRequestWithContext(r.Context(), http.MethodPost, tokenURL, strings.NewReader(form.Encode()))
    if err != nil {
        logger.Error("failed to create outbound request", "error", err.Error())
        writeError(w, http.StatusInternalServerError, "failed to create token request")
        return
    }
    req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

    start := time.Now()
    resp, err := client.Do(req)
    if err != nil {
        logger.Error("token endpoint call failed", "error", err.Error())
        writeError(w, http.StatusBadGateway, "token endpoint call failed")
        return
    }
    defer resp.Body.Close()

    respBody, err := io.ReadAll(resp.Body)
    if err != nil {
        logger.Error("failed reading token response", "error", err.Error())
        writeError(w, http.StatusBadGateway, "failed to read token response")
        return
    }

    latency := time.Since(start).Milliseconds()
    logger.Info("api response received", "status", resp.StatusCode, "bodySize", len(respBody), "latencyMs", latency)

    if resp.StatusCode < 200 || resp.StatusCode >= 300 {
        logger.Error("token endpoint returned error", "status", resp.StatusCode, "responseSnippet", preview(respBody))
        writeError(w, resp.StatusCode, "token endpoint returned error")
        return
    }

    var tokenResp map[string]interface{}
    if err := json.Unmarshal(respBody, &tokenResp); err != nil {
        logger.Error("failed to parse token response", "error", err.Error(), "responseSnippet", preview(respBody))
        writeError(w, http.StatusBadGateway, "invalid token response format")
        return
    }

    output := map[string]interface{}{
        "status": "success",
        "data":   tokenResp,
    }

    outBytes, err := json.Marshal(output)
    if err != nil {
        logger.Error("failed to marshal output", "error", err.Error())
        writeError(w, http.StatusInternalServerError, "failed to prepare response")
        return
    }

    logger.Info("function complete", "outputSize", len(outBytes), "status", "success")
    w.WriteHeader(http.StatusOK)
    w.Write(outBytes)
}

// writeError writes a JSON error response.
func writeError(w http.ResponseWriter, status int, message string) {
    resp := map[string]string{
        "status":  "error",
        "message": message,
    }
    b, _ := json.Marshal(resp)
    w.WriteHeader(status)
    w.Write(b)
}

// preview returns a safe, shortened string representation of data.
func preview(data []byte) string {
    max := 300
    if len(data) <= max {
        return string(data)
    }
    return string(data[:max])
}
