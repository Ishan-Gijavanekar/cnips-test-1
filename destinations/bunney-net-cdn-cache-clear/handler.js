/**
 * Normalized result type for Bunny purge calls
 */
type PurgeResult =
    | { ok: true; status: number; message?: string; }
    | { ok: false; status: number; error: string; };

/**
 * Extract bucket + object key from the SMN/OBS event
 *
 * The OBS/S3 notification payload wraps the actual event JSON string
 * inside `event.message`. This function parses it and pulls out the
 * first record's bucket and object key.
 */
export async function extractBunnyData(event: any): Promise<{ bucket: string; asset: string }> {
    const msg = typeof event?.message === "string" ? JSON.parse(event.message) : (event?.message ?? event);
    const rec = Array.isArray(msg?.Records) ? msg.Records[0] : msg?.Records?.[0];
    return {
        bucket: String(rec?.s3?.bucket?.name ?? ""),
        asset: String(rec?.s3?.object?.key ?? ""),
    };
}

/**
 * Look up the Pull Zone hostname mapped to a storage/bucket name
 *
 * Config is expected to have entries like:
 *   BUCKET_CNIPS_EVENT_TEST = "https://yourzone.b-cdn.net/"
 *
 * Hyphens in bucket names are replaced with underscores, then uppercased.
 */
async function getZoneURL(bucket: string, config: any): Promise<string> {
    if (!bucket.trim()) throw new Error("Bucket name is required");
    if (!config) throw new Error("Environment config is required");

    const bucketName = `bucket_${bucket.replace(/-/g, "_")}`.toUpperCase();
    const bucketNames = Object.keys(config).map((k) => { return (k === bucketName) ? config[bucketName] : null }).filter((x) => x !== null);

    if (!bucketNames || bucketNames.length <= 0) {
        throw new Error("No bucket NAme found in the configuration!");
    }

    return bucketNames[0];
}

/**
 * Purge call
 *
 * Makes a single purge POST request to Bunny.net.
 *
 * @param url            fully constructed purge endpoint with ?url=...
 * @param apiKey         Bunny API key
 * @returns PurgeResult  describing success/failure
 */
async function postJson(url: string, apiKey: string): Promise<PurgeResult> {
    const res = await fetch(url, {
        method: "POST",
        headers: { AccessKey: apiKey, "Content-Type": "application/json" }
    });
    let data: any = null; try { data = await res.json(); } catch { }
    if (res.ok) {
        return { ok: true, status: res.status, message: data?.Message ?? "OK"};
    }
    return { ok: false, status: res.status, error: data?.Message ?? `HTTP ${res.status}`};
}

/**
 * Generic retry wrapper.
 *
 * Retries when the provided function *throws*. Wrap non-OK responses in a throw to trigger retries.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
    let lastErr: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
        }
        if (attempt < retries) {
            await new Promise(r => setTimeout(r, delayMs * (attempt + 1))); // linear backoff
        }
    }
    throw lastErr;
}

/**
 * Purge one or many URLs
 *
 * - Validates absolute URLs
 * - Executes per-URL purge in parallel
 * - Retries per URL (2 retries = 3 total attempts) on 5xx/429/network errors
 */
export async function purgeUrl(urls: string | string[], purgeEndpoint: string, apiKey:string, LOG:any): Promise<PurgeResult[]> {
    const list = (Array.isArray(urls) ? urls : [urls]).map(s => s.trim()).filter(Boolean);
    if (!list.length) return [{ ok: false, status: 0, error: "No URLs provided" }];
    if (list.some(u => !/^https?:\/\//i.test(u))) return [{ ok: false, status: 0, error: "All URLs must be absolute http/https" }];
    LOG.info(`LOG: The url to be purged: ${urls}`);

    const tasks = urls.map((url)=>{
        const purgeUrl = `${purgeEndpoint}?url=${urls}`;
        // Wrap postJson so that retry-worthy responses THROW (so withRetry will actually retry).
        const retryable = async () => {
            const res = await postJson(purgeUrl, apiKey);
            // Retry policy: 5xx or 429
            if (!res.ok && (res.status >= 500 || res.status === 429)) {
                throw new Error(res.error || `HTTP ${res.status}`);
            }
            // success or non-retryable failure (e.g., 4xx) returns immediately
            return res; 
        };

        return withRetry(retryable, 2, 500)
            .catch((err) => {
            // If all retries failed, surface a normalized PurgeResult
            logger?.error(`Purge failed after retries for ${u}:`, err);
            return { ok: false, status: 0, error: err?.message ?? "Network/unknown error"} as PurgeResult;
        });
    })
    return Promise.all(tasks);
}

/**
 * CNIPS Destination entry point
 *
 * This function is called by CNIPS with:
 * - event  : the incoming OBS/SMN notification
 * - config : static destination config (API key, zone mappings, etc.)
 * - vars   : global variables object (must only contain strings)
 * - LOG    : logger instance
 *
 * It extracts bucket+asset, resolves zone host, builds purge URL,
 * and calls Bunny purge API with retries. Results are stored as strings
 * in vars for traceability.
 */
export async function execute(event: any, config: any, vars: any, LOG: any) {
    try {
        throw new Error(event);
        const { bucket, asset } = await extractBunnyData(event);
        LOG.info("OBS event --> bucket=%s asset=%s", bucket, asset);

        if (!bucket || !asset) {
            const msg = "Missing bucket or asset in event";
            LOG.error(msg); vars.last_error = msg; return;
        }

        const apiKey = config?.BUNNY_NET_API_KEY || vars?.BUNNY_NET_API_KEY;
        const purgeURL = config?.BUNNY_PURGE_URL || vars?.BUNNY_PURGE_URL;
        if (!apiKey) {
            const msg = "Missing Bunny API key (config.BUNNY_NET_API_KEY or vars.BUNNY_NET_API_KEY)";
            LOG.error(msg); vars.last_error = msg; return;
        }

        if(!purgeURL){
            const msg = "Missing Bunny purge api url (config.BUNNY_PURGE_URL or vars.BUNNY_PURGE_URL)";
            LOG.error(msg); vars.last_error = msg; return;
        }

        const host = await getZoneURL(bucket, config);         // e.g. "https://yourzone.b-cdn.net/"
        const path = encodeURI(asset).replace(/%2F/g, "/");    // keep slashes
        const url = `${host}${path}`;
        LOG.info("Purging: %s", url);

        const results = await purgeUrl([url], purgeURL, apiKey, LOG);
        const failed = results.find(r => !r.ok);
        vars.last_purge = JSON.stringify(results)
        if (failed) {
            LOG.error("Purge failed: %j", failed);
            vars.last_purge = results; vars.last_error = failed.error;
        } else {
            LOG.info("Purge OK: %j", results);
            vars.last_purge = "";
        }
    } catch (e: any) {
        const msg = `Unhandled error: ${e?.message || String(e)}`;
        LOG.error(msg); vars.last_error = msg;
        throw e;
    }
}
