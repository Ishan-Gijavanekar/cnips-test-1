// main.go
package handler

import (
    "bytes"
    "encoding/json"
    "io"
    "net/http"
    "net/url"
    "strconv"
    "strings"
    "time"

    "github.com/zinscky/log"
)

type tokenRequestInput struct {
    Code         string `json:"code"`
    RedirectURI  string `json:"redirect_uri"`
    ClientID     string `json:"client_id"`
    CodeVerifier string `json:"code_verifier"`
}

type errorResponse struct {
    Status string `json:"status"`
    Error  string `json:"error"`
}

type successResponse struct {
    Status string                 `json:"status"`
    Token  map[string]interface{} `json:"token"`
}

func writeJSON(w http.ResponseWriter, statusCode int, payload interface{}, logger *log.Logger) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    data, err := json.Marshal(payload)
    if err != nil {
        logger.Error("response marshal failed", "error", err.Error())
        // fallback minimal error string
        w.Write([]byte(`{"status":"error","error":"internal marshal error"}`))
        return
    }
    if _, err := w.Write(data); err != nil {
        logger.Error("write response failed", "error", err.Error())
    }
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}

func HandleRequest(w http.ResponseWriter, r *http.Request) {
    LOG := log.NewLogger(r, log.Info)
    LOG.Info("function entry", "payloadSize", r.ContentLength, "method", r.Method)

    // Ensure POST method
    if r.Method != http.MethodPost {
        LOG.Error("invalid method", "method", r.Method)
        writeJSON(w, http.StatusMethodNotAllowed, errorResponse{Status: "error", Error: "method not allowed"}, LOG)
        return
    }

    // Load config from headers (simulating provided config map)
    config := map[string]string{
        "tokenurl": strings.TrimSpace(r.Header.Get("X-Config-Tokenurl")),
        "clientid": strings.TrimSpace(r.Header.Get("X-Config-Clientid")),
        "timeout": strings.TrimSpace(r.Header.Get("X-Config-Timeout")),
    }
    LOG.Info("config loaded", "hasTokenurl", config["tokenurl"] != "", "hasClientid", config["clientid"] != "", "timeout", config["timeout"])
    vars := map[string]string{}
    LOG.Info("vars loaded", "varsCount", len(vars))

    bodyBytes, err := io.ReadAll(r.Body)
    if err != nil {
        LOG.Error("read body failed", "error", err.Error())
        writeJSON(w, http.StatusBadRequest, errorResponse{Status: "error", Error: "failed to read request body"}, LOG)
        return
    }
    if len(bodyBytes) == 0 {
        LOG.Error("empty body", "error", "no payload")
        writeJSON(w, http.StatusBadRequest, errorResponse{Status: "error", Error: "request body is empty"}, LOG)
        return
    }

    preview := string(bodyBytes[:min(len(bodyBytes), 200)])
    LOG.Info("received payload", "preview", preview)

    var input tokenRequestInput
    if err := json.Unmarshal(bodyBytes, &input); err != nil {
        LOG.Error("json unmarshal failed", "error", err.Error(), "inputPreview", preview)
        writeJSON(w, http.StatusBadRequest, errorResponse{Status: "error", Error: "invalid JSON payload"}, LOG)
        return
    }

    // Validate required fields
    if strings.TrimSpace(input.Code) == "" {
        LOG.Error("validation failed", "error", "code missing")
        writeJSON(w, http.StatusBadRequest, errorResponse{Status: "error", Error: "code is required"}, LOG)
        return
    }
    if strings.TrimSpace(input.RedirectURI) == "" {
        LOG.Error("validation failed", "error", "redirect_uri missing")
        writeJSON(w, http.StatusBadRequest, errorResponse{Status: "error", Error: "redirect_uri is required"}, LOG)
        return
    }

    tokenURL := strings.TrimSpace(config["tokenurl"])
    if tokenURL == "" {
        LOG.Error("config missing", "error", "tokenurl is empty")
        writeJSON(w, http.StatusBadRequest, errorResponse{Status: "error", Error: "tokenurl config is required"}, LOG)
        return
    }

    clientID := strings.TrimSpace(input.ClientID)
    if clientID == "" {
        clientID = strings.TrimSpace(config["clientid"])
    }
    if clientID == "" {
        LOG.Error("validation failed", "error", "client_id missing")
        writeJSON(w, http.StatusBadRequest, errorResponse{Status: "error", Error: "client_id is required"}, LOG)
        return
    }

    timeoutSeconds := 30
    if strings.TrimSpace(config["timeout"]) != "" {
        if t, err := strconv.Atoi(strings.TrimSpace(config["timeout"])); err == nil && t > 0 {
            timeoutSeconds = t
        } else {
            LOG.Error("invalid timeout", "value", config["timeout"], "error", "must be positive integer")
            writeJSON(w, http.StatusBadRequest, errorResponse{Status: "error", Error: "timeout config must be a positive integer"}, LOG)
            return
        }
    }
    LOG.Info("validated input", "hasCodeVerifier", strings.TrimSpace(input.CodeVerifier) != "", "clientIDSet", clientID != "", "timeoutSeconds", timeoutSeconds)

    form := url.Values{}
    form.Set("grant_type", "authorization_code")
    form.Set("code", strings.TrimSpace(input.Code))
    form.Set("redirect_uri", strings.TrimSpace(input.RedirectURI))
    form.Set("client_id", clientID)
    if strings.TrimSpace(input.CodeVerifier) != "" {
        form.Set("code_verifier", strings.TrimSpace(input.CodeVerifier))
    }

    req, err := http.NewRequest(http.MethodPost, tokenURL, strings.NewReader(form.Encode()))
    if err != nil {
        LOG.Error("build request failed", "error", err.Error(), "tokenURL", tokenURL)
        writeJSON(w, http.StatusInternalServerError, errorResponse{Status: "error", Error: "failed to build token request"}, LOG)
        return
    }
    req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

    LOG.Info("calling token endpoint", "url", tokenURL, "method", http.MethodPost)
    client := &http.Client{Timeout: time.Duration(timeoutSeconds) * time.Second}
    start := time.Now()
    resp, err := client.Do(req)
    latency := time.Since(start)
    if err != nil {
        LOG.Error("token request failed", "error", err.Error(), "url", tokenURL, "latencyMs", latency.Milliseconds())
        writeJSON(w, http.StatusBadGateway, errorResponse{Status: "error", Error: "token endpoint request failed"}, LOG)
        return
    }
    defer resp.Body.Close()

    respBody, err := io.ReadAll(resp.Body)
    if err != nil {
        LOG.Error("read token response failed", "error", err.Error())
        writeJSON(w, http.StatusBadGateway, errorResponse{Status: "error", Error: "failed to read token response"}, LOG)
        return
    }
    LOG.Info("token endpoint response", "status", resp.StatusCode, "bodySize", len(respBody), "latencyMs", latency.Milliseconds())

    if resp.StatusCode < 200 || resp.StatusCode >= 300 {
        snippet := string(respBody[:min(len(respBody), 300)])
        LOG.Error("token endpoint returned error", "status", resp.StatusCode, "bodySnippet", snippet)
        writeJSON(w, http.StatusBadGateway, errorResponse{Status: "error", Error: "token endpoint returned non-2xx status"}, LOG)
        return
    }

    var tokenPayload map[string]interface{}
    decoder := json.NewDecoder(bytes.NewReader(respBody))
    decoder.UseNumber()
    if err := decoder.Decode(&tokenPayload); err != nil {
        LOG.Error("token response unmarshal failed", "error", err.Error(), "bodySnippet", string(respBody[:min(len(respBody), 300)]))
        writeJSON(w, http.StatusBadGateway, errorResponse{Status: "error", Error: "invalid token response format"}, LOG)
        return
    }

    response := successResponse{Status: "success", Token: tokenPayload}
    respBytes, err := json.Marshal(response)
    if err != nil {
        LOG.Error("marshal success response failed", "error", err.Error())
        writeJSON(w, http.StatusInternalServerError, errorResponse{Status: "error", Error: "failed to prepare response"}, LOG)
        return
    }

    LOG.Info("function complete", "outputSize", len(respBytes), "status", "success")
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    if _, err := w.Write(respBytes); err != nil {
        LOG.Error("write final response failed", "error", err.Error())
    }
}
