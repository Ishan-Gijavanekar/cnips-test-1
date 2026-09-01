// Cidaas + OneTrust + SFMC (ESM, fetch, LOG)
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { inspect } from "util"
import { Logger } from "@cnips/simplelog";


/** ---------- Utilities ---------- */

const clean = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined));


class CidaasApiClient {
    #token_cache_setter
    #token_cache_getter
    #internal_token_cache

    token_request = async () => {
        const response = await this.auth_client.post("/token-srv/token", {
            grant_type: "client_credentials",
            client_id: this.client_id,
            client_secret: this.client_secret,
        })
        return response.data
    }

    authentication_hook = async (config) => {
        const now = Math.trunc(Date.now() / 1000)
        const cached_token = this.token_cache
        let token

        if (
            !cached_token?.access_token ||
            !cached_token?.expires_at ||
            cached_token?.expires_at < now
        ) {
            token = await this.token_request()
            token.expires_at = now + token.expires_in - 60

            this.token_cache = token
        } else {
            token = cached_token
        }

        config.headers = config.headers || {}
        config.headers.Authorization = `${token.token_type} ${token.access_token}`
        return config
    }

    log_error_hook = async (error) => {
        console.error("Error occurred", error)

        if (error.request?.data) {
            console.error(
                "Request",
                inspect(error.request.data, {
                    showHidden: false,
                    depth: null,
                    colors: true,
                }),
            )
        }

        if (error.response?.data) {
            console.error(
                "Response",
                inspect(error.response.data, {
                    showHidden: false,
                    depth: null,
                    colors: true,
                }),
            )
        }

        return Promise.reject(error)
    }

    set token_cache(token) {
        if (this.#token_cache_setter instanceof Function) {
            this.#token_cache_setter(token)
        }

        this.#internal_token_cache = token
    }

    get token_cache() {
        if (this.#token_cache_getter instanceof Function) {
            return this.#token_cache_getter()
        } else {
            return this.#internal_token_cache
        }
    }

    constructor(
        tenant_url,
        client_id,
        client_secret,
        token_cache_setter,
        token_cache_getter,
    ) {
        this.client_id = client_id
        this.client_secret = client_secret
        this.#internal_token_cache = {}
        this.#token_cache_setter = token_cache_setter
        this.#token_cache_getter = token_cache_getter

        // Create axios instances with interceptors
        this.auth_client = axios.create({
            baseURL: tenant_url,
        })

        this.api_client = axios.create({
            baseURL: tenant_url,
        })

        // Add request interceptor for authentication
        this.api_client.interceptors.request.use(this.authentication_hook)

        // Add response interceptor for error handling
        this.auth_client.interceptors.response.use(
            (response) => response,
            this.log_error_hook,
        )
        this.api_client.interceptors.response.use(
            (response) => response,
            this.log_error_hook,
        )
    }

    create_pass = async (pass, pass_user, pass_holder, options = {}) => {
        const data = {
            pass: pass,
            passUser: pass_user,
            passUserHolder: pass_holder,
        }

        console.info("Pass request", data)

        const response = await this.api_client.post(
            "/pass-srv/pass",
            data,
            options,
        )

        return response.data
    }

    update_user = async (
        sub,
        user_data = {},
        custom_fields = {},
        provider = "self",
        options = {},
    ) => {
        user_data.provider = provider
        const data = {
            userData: user_data,
            customFields: custom_fields,
        }

        console.info("User update request", data)

        const response = await this.api_client.put(
            `/user-srv/users/${sub}`,
            data,
            options,
        )

        return response.data
    }

    get_user_group_maps = async (sub, options = {}) => {
        const response = await this.api_client.get(
            `/groups-srv/usergroups/maps/${sub}`,
            options,
        )

        return response.data
    }

    update_user_group_maps = async (
        sub,
        action,
        user_group_maps,
        options = {},
    ) => {
        const data = {
            instruction: action,
            usergroupmaps: user_group_maps,
        }

        console.info("User group map update request", data)

        const response = await this.api_client.post(
            `/groups-srv/usergroups/maps/${sub}`,
            data,
            options,
        )

        return response.data
    }

    get_sub_by_identifier = async (identifier, options = {}) => {
        const data = {
            userId: identifier.toLowerCase(),
        }

        console.info("User existence check request", data)

        const response = await this.api_client.post(
            "/useractions-srv/userexistence",
            data,
            options,
        )

        return response.data.data?.sub
    }

    get_client_by_id = async (client_id, options = {}) => {
        const response = await this.api_client.get(
            `/apps-srv/clients/${client_id}`,
            options,
        )

        return response.data.data
    }

    get_consent_versions_consent_id = async (consent_id, options = {}) => {
        const data = [consent_id]

        console.info("Get versions for consent", data)

        const response = await this.api_client.post(
            "/consent-management-srv/v2/consent/versions/listby/consentids",
            data,
            options,
        )

        return response.data.data
    }

    declare_user_consents = async (
        sub,
        consents,
        client_id = this.client_id,
        options = {},
    ) => {
        const data = {
            client_id: client_id,
            sub: sub,
            consentAccepts: consents,
        }

        console.info("Consent declaration request", data)

        const response = await this.api_client.post(
            "/consent-management-srv/consent",
            data,
            options,
        )

        return response.data
    }

    bulk_import = async (bulkEntries) => {
        const response = await this.api_client.post("/users-srv/user/bulk", bulkEntries);
        return response
    }
}

class OneTrustApiClient {
    #token_cache_setter
    #token_cache_getter
    #internal_token_cache

    token_request = async () => {
        const params = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.client_id,
            client_secret: this.client_secret,
        })

        const response = await this.auth_client.post(
            "/api/access/v1/oauth/token",
            params,
        )
        return response.data
    }

    authentication_hook = async (config) => {
        const now = Math.trunc(Date.now() / 1000)
        const cached_token = this.token_cache
        let token

        if (
            !cached_token?.access_token ||
            !cached_token?.expires_at ||
            cached_token?.expires_at < now
        ) {
            token = await this.token_request()
            token.expires_at = now + token.expires_in - 60

            this.token_cache = token
        } else {
            token = cached_token
        }

        config.headers = config.headers || {}
        config.headers.Authorization = `${token.token_type} ${token.access_token}`
        return config
    }

    log_error_hook = async (error) => {
        console.error("Error occurred", error)

        if (error.request?.data) {
            console.error(
                "Request",
                inspect(error.request.data, {
                    showHidden: false,
                    depth: null,
                    colors: true,
                }),
            )
        }

        if (error.response?.data) {
            console.error(
                "Response",
                inspect(error.response.data, {
                    showHidden: false,
                    depth: null,
                    colors: true,
                }),
            )
        }

        return Promise.reject(error)
    }

    set token_cache(token) {
        if (this.#token_cache_setter instanceof Function) {
            this.#token_cache_setter(token)
        }

        this.#internal_token_cache = token
    }

    get token_cache() {
        if (this.#token_cache_getter instanceof Function) {
            return this.#token_cache_getter()
        } else {
            return this.#internal_token_cache
        }
    }

    constructor(
        api_base_url,
        privacy_portal_base_url,
        client_id,
        client_secret,
        token_cache_setter,
        token_cache_getter,
    ) {
        this.client_id = client_id
        this.client_secret = client_secret
        this.#internal_token_cache = {}
        this.#token_cache_setter = token_cache_setter
        this.#token_cache_getter = token_cache_getter

        // Create axios instances with interceptors
        this.auth_client = axios.create({
            baseURL: api_base_url,
        })

        this.api_client = axios.create({
            baseURL: api_base_url,
        })

        this.privacy_portal_client = axios.create({
            baseURL: privacy_portal_base_url,
        })

        // Add request interceptor for authentication
        this.api_client.interceptors.request.use(this.authentication_hook)
        this.privacy_portal_client.interceptors.request.use(
            this.authentication_hook,
        )

        // Add response interceptor for error handling
        this.auth_client.interceptors.response.use(
            (response) => response,
            this.log_error_hook,
        )
        this.api_client.interceptors.response.use(
            (response) => response,
            this.log_error_hook,
        )
        this.privacy_portal_client.interceptors.response.use(
            (response) => response,
            this.log_error_hook,
        )
    }

    get_collection_point_token = async (collection_point_id, options = {}) => {
        const response = await this.api_client.get(
            `/api/consentmanager/v1/collectionpoints/${collection_point_id}/token`,
            options,
        )

        return response.data.token
    }

    send_receipt = async (
        collection_point_token,
        identifier,
        data_elements,
        purposes,
        options = {},
    ) => {
        const data = {
            identifier: identifier,
            interactionDate: new Date(),
            shortLinkToken: true,
            requestInformation: collection_point_token,

            // test: true, // remove after testing is done

            purposes: purposes,

            dsDataElements: data_elements,
        }

        console.info("Consent receipt", data)

        const response = await this.privacy_portal_client.post(
            "/request/v1/consentreceipts",
            data,
            options,
        )

        return response.data
    }
}

/** ---------- SFMC API ---------- */

class SfmcApiClient {
    constructor(subdomain, account_id, client_id, client_secret) {
        this.auth_base_url = `https://${subdomain}.auth.marketingcloudapis.com`;
        this.rest_base_url = `https://${subdomain}.rest.marketingcloudapis.com`;
        this.soap_base_url = `https://${subdomain}.rest.marketingcloudapis.com`;
        this.account_id = account_id;
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.token_cache = {};

        this.auth_client = axios.create({ baseURL: this.auth_base_url });
        this.rest_client = axios.create({ baseURL: this.rest_base_url });
        this.soap_client = axios.create({ baseURL: this.soap_base_url });

        this.rest_client.interceptors.request.use(this.authentication_hook);
        this.soap_client.interceptors.request.use(this.authentication_hook);

        this.auth_client.interceptors.response.use(r => r, this.log_error_hook);
        this.rest_client.interceptors.response.use(r => r, this.log_error_hook);
        this.soap_client.interceptors.response.use(r => r, this.log_error_hook);
    }

    token_request = async () => {
        console.info("[SFMC Client] Requesting new access token...");
        const response = await axios.post(`${this.auth_base_url}/v2/token`, {
            grant_type: "client_credentials",
            client_id: this.client_id,
            client_secret: this.client_secret,
            account_id: this.account_id,
        });
        console.info("[SFMC Client] Received new access token.");
        return response.data;
    };

    authentication_hook = async (config) => {
        const now = Math.trunc(Date.now() / 1000);
        if (!this.token_cache.access_token || this.token_cache.expires_at < now) {
            console.info("[SFMC Client] Token expired or missing. Fetching new one...");
            const token_response = await this.token_request();
            this.token_cache = token_response;
            this.token_cache.expires_at = now + token_response.expires_in - 60;
        }

        config.headers = config.headers || {};
        config.headers.Authorization = `${this.token_cache.token_type} ${this.token_cache.access_token}`;
        return config;
    };

    log_error_hook = async (error) => {
        console.error("[SFMC Client] Error occurred during request:");
        if (error.response?.data) {
            console.error(inspect(error.response.data, { showHidden: false, depth: null, colors: true }));
        }
        return Promise.reject(error);
    };


    async upsertDataEventsByDEKey(customObjectkey, rowset) {
        console.log(`[SFMC] Upserting to DE [${customObjectkey}]`);
        return this.rest_client.post(`/hub/v1/dataevents/key:${customObjectkey}/rowset`, rowset);
    }
}

/** ========== EXECUTE ENTRYPOINT ========== */

export async function execute(event, config, vars, LOG) {
    
    try {
        LOG.info("Executing event: %s", event);
        LOG.debug("Config: %j", config);
        LOG.debug("Vars: %j", vars);

        // --- Instantiate API clients (read from config first, then vars) ---
        const cidaas = new CidaasApiClient(
            config.cidaas_tenant_url,
            config.cidaas_client_id,
            config.cidaas_client_secret,
            (token) => {
                console.info("Token cache setter called.", token)
                vars.cidaas_token_cache = JSON.stringify(token)
            },
            () => {
                console.info("Token cache getter called.")
                const cached_token = vars.cidaas_token_cache

                if (cached_token) {
                    console.info("Cache hit.")
                    try {
                        return JSON.parse(cached_token)
                    } catch (error) {
                        console.error("Error while parsing token cache.", error)
                    }
                } else {
                    console.info("Cache miss.")
                }
            },
        );

        const onetrust = new OneTrustApiClient(
            config.ot_api_base_url,
            config.ot_privacy_portal_base_url,
            config.ot_client_id,
            config.ot_client_secret,
            (token) => {
                console.info("Token cache setter called.", token)
                vars.one_trust_token_cache = JSON.stringify(token)
            },
            () => {
                console.info("Token cache getter called.")
                const cached_token = vars.one_trust_token_cache

                if (cached_token) {
                    console.info("Cache hit.")
                    try {
                        return JSON.parse(cached_token)
                    } catch (error) {
                        console.error("Error while parsing token cache.", error)
                    }
                } else {
                    console.info("Cache miss.")
                }
            }
        );

        const sfmc = new SfmcApiClient(
            config.sfmcSubdomain,
            config.sfmcAccountId,
            config.sfmcClientId,
            config.sfmcClientSecret
        );

        // --- Determine email from multiple possible inputs ---
        const bulk = event.cidaas_bulk;
        const email = String(bulk.email).trim().toLowerCase();
        if (!email) throw new Error("email is required (bulk.email / identities[0].email / pass.user.email)");

        // 1) Cidaas: bulk import (create/upsert) with sanitized payload

        let sub;
        try {
            const createRes = await cidaas.bulk_import([bulk]);
            LOG.debug("[Cidaas] bulk_import response: %j", createRes);
            const states = createRes?.data?.process_states || [];
            sub =
                states.find((s) => String(s?.identifier?.email || "").toLowerCase() === email)?.sub ||
                states[0]?.sub;

            if (!sub) {
                LOG.warn("[Cidaas] No sub in bulk response; resolving by identifier %s", email);
                sub = await cidaas.get_sub_by_identifier(email);
            }
            if (!sub) throw new Error("[Cidaas] Could not determine user sub after bulk import + lookup");
            LOG.info("Cidaas user created/resolved: %s", sub);
        } catch (err) {
            LOG.warn("[Cidaas] Bulk import failed (%s). Trying lookup by identifier…", err?.status || "unknown");
            sub = await cidaas.get_sub_by_identifier(email);
            if (!sub) throw err; // rethrow original if lookup fails
            LOG.info("Cidaas user exists, resolved sub: %s", sub);
        }

        // 2) Cidaas: create passes (many)
        const passesForSfmc = [];
        for (const item of event.passes || []) {
            const pass = item.pass || {};
            const holder = item.passUserHolder || {};

            const eid = pass.productId || "personal-data";
            const passPayload = {
                title: pass.title || "My Pass",
                passId: pass.passId || uuidv4(),
                state: pass.state || undefined,
                productId: eid,
                productName: pass.productName || "Event",
                productInstanceId: pass.productInstanceId || `${eid}_${uuidv4()}`,
                creationdate: pass.creationdate,
                lastupdate: pass.lastupdate,
                customFields: pass.customFields || {},
            };

            const passUser = clean({
                givenName: pass.given_name || "_",
                familyName: pass.family_name || "_",
                gender: pass.gender,
                additionalTitle: pass.gender,
                locale: pass.locale,
                customFields: pass.userCustomFields || {},
                address: clean({
                    formatted: "",
                    streetAddress: pass.streetAddress,
                    additionalAddress: pass.additionalAddress,
                    locality: pass.locality,
                    postalCode: pass.postcode || pass.postalCode,
                    country: pass.country,
                    region: pass.region,
                }),
            });

            if (holder?.sub && holder.sub !== sub) {
                LOG.warn(
                    "[Cidaas] Incoming holder.sub (%s) != resolved sub (%s). Overriding.",
                    holder.sub,
                    sub
                );
                throw Error("Passes are inconsitent with user")
            }
            const passHolder = clean({
                email: holder?.email || email,
                sub: sub, // always resolved sub from this tenant
            });

            const passResp = await cidaas.create_pass(passPayload, passUser, passHolder);
            const createdPassId = passResp?.passId || passResp?.id || passPayload.passId;
            const finalPass = { ...passPayload, passId: createdPassId };
            passesForSfmc.push(finalPass);

            LOG.info("Created pass %s for sub %s", createdPassId, passHolder.sub);
        }

        // 3) OneTrust: receipt & persist link token to Cidaas user
        if (event.one_trust_data) {
            const ot = event.one_trust_data || {};
            const collection_point_id = ot.collection_point;
            if (!collection_point_id) throw new Error("one_trust_data.collection_point is required");

            const purposes = ot.purposes;
            const data_elements = ot.data_elements;
            if (!Array.isArray(purposes) || purposes.length === 0) {
                throw new Error("one_trust_data.purposes must be a non-empty array");
            }
            if (!data_elements || typeof data_elements !== "object") {
                throw new Error("one_trust_data.data_elements must be provided as an object");
            }

            const cpToken = await onetrust.get_collection_point_token(collection_point_id);
            if (!cpToken) throw new Error(`Could not get request token for collection point '${collection_point_id}'`);

            const receipt = await onetrust.send_receipt(cpToken, email, data_elements, purposes);
            const one_trust_token = receipt?.linkToken;
            if (!one_trust_token) throw new Error("OneTrust receipt did not return linkToken");

            await cidaas.update_user(sub, {}, { one_trust_token });
            LOG.info("Persisted OneTrust token to user %s", sub);
        } else {
            LOG.info("No OneTrust data provided")
        }


        // 4) SFMC: write DE rows
        const entries = event.sfmc_data_entries;
        if (!Array.isArray(entries) || entries.length === 0) {
            throw new Error("sfmc_data_entries must be provided");
        }

        for (const entry of entries) {
            const deId = entry?.dataExtension?.extensionId;
            const rows = entry?.rows;
            if (deId === "CIAM_Consumer") {
                rows[0].values["One_trust_token"] = one_trust_token
            }
            if (!deId || !Array.isArray(rows)) {
                throw new Error("Each sfmc_data_entries item must have dataExtension.extensionId and rows[]");
            }
            await sfmc.upsertDataEventsByDEKey(deId, rows);
            LOG.info("[SFMC] Wrote %d row(s) to DE %s", rows.length, deId);
        }

        LOG.info("Execution finished.");
    } catch (error) {
        LOG.error("Error executing destination:", error);
        throw error;
    }
}
