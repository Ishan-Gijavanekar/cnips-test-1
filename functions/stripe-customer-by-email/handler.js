import { logger, levels } from "@cnips/log";

const LOG = logger(process.env.APP || "default", levels.info);

/**
 * Your expressjs handler function.
 * @param {Request} req 
 * @param {Response} res 
 * @returns 
 */
async function handleRequest(req, res) {
    const payloadPreview = (() => {
        try {
            const str = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
            return str ? str.substring(0, 200) : "";
        } catch (e) {
            return "";
        }
    })();
    LOG.info("function entry", "payloadSize", payloadPreview.length, "hasBody", req.body !== undefined);
    try {
        // Resolve config values (from headers as per platform pattern)
        const stripeBaseUrlHeader = req.headers ? req.headers["stripebaseurl"] : undefined;
        const stripeBaseUrl = typeof stripeBaseUrlHeader === "string" && stripeBaseUrlHeader.trim() !== "" ? stripeBaseUrlHeader.trim() : "https://api.stripe.com";
        LOG.info("config loaded", "stripeBaseUrlProvided", !!stripeBaseUrlHeader, "stripeBaseUrl", stripeBaseUrl);

        // Parse and validate body
        let body = req.body;
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch (err) {
                LOG.error("json parse failed", "error", err.message, "inputPreview", payloadPreview);
                return res.status(400).json({ error: "Invalid JSON body" });
            }
        }
        if (body === null || typeof body !== "object" || Array.isArray(body)) {
            LOG.error("body validation failed", "error", "body must be an object", "inputPreview", payloadPreview);
            return res.status(400).json({ error: "Request body must be a JSON object" });
        }

        const email = body.email;
        if (typeof email !== "string" || email.trim() === "") {
            LOG.error("email validation failed", "error", "email missing or not string");
            return res.status(400).json({ error: "Field 'email' is required and must be a non-empty string" });
        }

        const stripeSecretKey = body.stripeSecretKey;
        if (typeof stripeSecretKey !== "string" || stripeSecretKey.trim() === "") {
            LOG.error("stripe key validation failed", "error", "stripeSecretKey missing or not string");
            return res.status(400).json({ error: "Field 'stripeSecretKey' is required and must be a non-empty string" });
        }

        const fetchFn = typeof fetch === "function" ? fetch : null;
        if (!fetchFn) {
            LOG.error("fetch unavailable", "error", "global fetch is not defined");
            return res.status(500).json({ error: "HTTP client unavailable" });
        }

        const encodedEmail = encodeURIComponent(email.trim());
        const url = `${stripeBaseUrl}/v1/customers?limit=1&email=${encodedEmail}`;
        LOG.info("calling external api", "url", url, "method", "GET", "email", email.trim());

        const start = Date.now();
        let response;
        try {
            response = await fetchFn(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${stripeSecretKey.trim()}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
            });
        } catch (err) {
            LOG.error("api call failed", "error", err.message, "url", url);
            return res.status(502).json({ error: "Failed to reach Stripe API" });
        }

        const latency = Date.now() - start;
        let respText = "";
        try {
            respText = await response.text();
        } catch (err) {
            LOG.error("read response failed", "error", err.message, "status", response && response.status);
            return res.status(502).json({ error: "Failed to read Stripe response" });
        }
        LOG.info("api response received", "status", response.status, "bodySize", respText.length, "latencyMs", latency);

        if (!response.ok) {
            const snippet = respText.substring(0, 200);
            LOG.error("stripe api returned error", "status", response.status, "bodySnippet", snippet);
            return res.status(response.status).json({ error: "Stripe API error", details: snippet });
        }

        let respJson;
        try {
            respJson = JSON.parse(respText);
        } catch (err) {
            LOG.error("response json parse failed", "error", err.message, "bodySnippet", respText.substring(0, 200));
            return res.status(502).json({ error: "Invalid JSON from Stripe" });
        }

        if (!respJson || typeof respJson !== "object") {
            LOG.error("response structure invalid", "error", "response is not object");
            return res.status(502).json({ error: "Unexpected Stripe response format" });
        }

        let customerId = null;
        if (Array.isArray(respJson.data) && respJson.data.length > 0 && respJson.data[0] && typeof respJson.data[0].id === "string") {
            customerId = respJson.data[0].id;
        }

        const result = { customerId };
        const outputPreview = JSON.stringify(result).substring(0, 200);
        LOG.info("function complete", "outputSize", outputPreview.length, "hasCustomerId", customerId !== null);
        return res.json(result);

    } catch (error) {
        LOG.error("unexpected error", "error", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export { handleRequest };