import { logger, levels } from "@cnips/log";

const LOG = logger(process.env.APP || "default", levels.info)
type GroupInfo = { groupId: string; parentId?: string | null; groupName?: string };

async function createGroup(domain: string, authHeader: string, groupId: string, groupName?: string) {
    const url = `https://${domain}/groups-srv/usergroups`;
    LOG.info(`createGroup: POST ${url} body=${groupId}`);
    const body = { groupId, groupName: groupName || groupId, parentId: "root" };
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { Authorization: authHeader, "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        LOG.info(`createGroup: response status=${resp.status}`);
        let json: any = null;
        try {
            json = await resp.json();
            LOG.info(`createGroup: response body=${JSON.stringify(json)}`);
        } catch (e: any) {
            LOG.warn(`createGroup: failed to parse JSON: ${e.message}`);
        }
        return { status: resp.status, body: json };
    } catch (err: any) {
        LOG.error(`createGroup: fetch exception: ${err.message}`, { stack: err.stack });
        throw err;
    }
}

async function checkGroup(domain: string, authHeader: string, groupId: string): Promise<{ found: boolean; data?: any; status: number }> {
    const url = `https://${domain}/groups-srv/usergroups?groupId=${encodeURIComponent(groupId)}`;
    LOG.info(`checkGroup: GET ${url}`);
    try {
        const resp = await fetch(url, { method: "GET", headers: { Authorization: authHeader } });
        LOG.info(`checkGroup: response status=${resp.status}`);
        const status = resp.status;
        if (status === 200) {
            let body: any = null;
            try {
                body = await resp.json();
                LOG.info(`checkGroup: response body=${JSON.stringify(body)}`);
            } catch (e: any) {
                LOG.warn(`checkGroup: failed to parse JSON: ${e.message}`);
            }
            return { found: true, data: body, status: 200 };
        } else if (status === 204) {
            LOG.info(`checkGroup: no content (204)`);
            return { found: false, status: 204 };
        } else if (status === 401) {
            LOG.warn(`checkGroup: unauthorized (401)`);
            return { found: false, status: 401 };
        } else if (status === 404) {
            LOG.info(`checkGroup: not found (404)`);
            return { found: false, status: 404 };
        } else {
            LOG.warn(`checkGroup: unexpected status ${status}`);
            return { found: false, status };
        }
    } catch (err: any) {
        LOG.error(`checkGroup: fetch exception: ${err.message}`, { stack: err.stack });
        throw err;
    }
}

async function handleRequest(req, res) {
    LOG.info(`handleRequest: start ${req.method} ${req.path}`);
    try {
        let client_id = req.headers["client_id"];
        let client_secret = req.headers["client_secret"];
        let domain = req.headers["domain"];
        let default_app_client_id = req.headers["default_app_client_id"];

        LOG.info(`handleRequest: headers CLIENT_ID=${client_id ? 'present' : 'missing'} CLIENT_SECRET=${client_secret ? 'present' : 'missing'} DOMAIN=${domain}`);
        if (!client_id) {
            LOG.error("handleRequest: Client ID is missing in the request headers");
            return res.status(400).json({ error: "Client ID is required" });
        }
        if (!client_secret) {
            LOG.error("handleRequest: Client Secret is missing in the request headers");
            return res.status(400).json({ error: "Client Secret is required" });
        }
        if (!domain) {
            LOG.error("handleRequest: Domain is missing in the request headers");
            return res.status(400).json({ error: "Domain is required" });
        }
        LOG.info(`Req body ${JSON.stringify(req.body)} ----------`)
        const reqBody = JSON.parse(req.body?.data||{})
        const { givenName, familyName, email, groups: groupsRaw, companyName } = reqBody || {};
        LOG.info(`handleRequest: body email=${email} givenName=${givenName} familyName=${familyName} groupsRaw=${groupsRaw} companyName=${companyName}`);

        const auth_url = `https://${domain}/token-srv/token`;
        const userUrl = `https://${domain}/users-srv/user/create/byadmin`;
        LOG.info(`handleRequest: auth_url=${auth_url} userUrl=${userUrl}`);

        const groupsList = (groupsRaw || "").split(",").map((g: string) => g.trim()).filter((g: string) => g.length > 0);
        LOG.info(`handleRequest: parsed groupsList=${JSON.stringify(groupsList)}`);

        LOG.info(`handleRequest: fetching access token`);
        let resp;
        try {
            resp = await fetch(auth_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ client_id, client_secret, grant_type: "client_credentials" }),
            });
            LOG.info(`handleRequest: auth response status=${resp.status}`);
        } catch (err: any) {
            LOG.error(`handleRequest: auth fetch exception: ${err.message}`, { stack: err.stack });
            return res.status(500).json({ error: "Auth fetch failed", detail: err.message });
        }

        if (!resp.ok) {
            const text = await resp.text().catch(() => "<no body>");
            LOG.error(`handleRequest: auth failed status=${resp.status} body=${text}`);
            return res.status(resp.status).json({ error: "Auth failed", detail: text });
        }
        let data: any = null;
        try {
            data = await resp.json();
            LOG.info(`handleRequest: auth response body=${JSON.stringify(data)}`);
        } catch (err: any) {
            LOG.warn(`handleRequest: failed to parse auth JSON: ${err.message}`);
        }
        const token = data?.access_token;
        const authHeader = `Bearer ${token}`;
        LOG.info(` ------- ${authHeader} --------- `)

        const createdOrFoundGroups: GroupInfo[] = [];
        const errors: Array<{ group: string; error: string; status?: number }> = [];

        const uniqueGroups: string[] = Array.from(new Set(groupsList));
        LOG.info(`handleRequest: uniqueGroups=${JSON.stringify(uniqueGroups)}`);

        for (const g of uniqueGroups) {
            LOG.info(`handleRequest: processing group '${g}'`);
            try {
                const check = await checkGroup(domain, authHeader, g);
                LOG.info(`handleRequest: checkGroup result for '${g}': found=${check.found}, status=${check.status}`);
                if (check.status === 401) {
                    LOG.error(`handleRequest: unauthorized when checking group '${g}'`);
                    return res.status(401).json({ error: "Unauthorized when calling groups service" });
                }
                if (check.found) {
                    const d = check.data?.data ?? check.data;
                    LOG.info(`handleRequest: group '${g}' found with data=${JSON.stringify(d)}`);
                    createdOrFoundGroups.push({ groupId: g, parentId: d?.parentId ?? null, groupName: d?.groupName ?? g });
                } else {
                    LOG.info(`handleRequest: group '${g}' not found, creating`);
                    let createResp;
                    try {
                        createResp = await createGroup(domain, authHeader, g, g);
                    } catch (err: any) {
                        LOG.error(`handleRequest: exception creating group '${g}': ${err.message}`, { stack: err.stack });
                        errors.push({ group: g, error: err.message });
                        continue;
                    }
                    LOG.info(`handleRequest: createGroup response for '${g}': status=${createResp.status} body=${JSON.stringify(createResp.body)}`);
                    if ([200, 201].includes(createResp.status)) {
                        const d = createResp.body?.data ?? createResp.body;
                        createdOrFoundGroups.push({ groupId: g, parentId: d?.parentId ?? 'root', groupName: d?.groupName ?? g });
                    } else if (createResp.status === 401) {
                        LOG.error(`handleRequest: unauthorized when creating group '${g}'`);
                        return res.status(401).json({ error: "Unauthorized when creating group", group: g });
                    } else {
                        LOG.error(`handleRequest: failed to create group '${g}' status=${createResp.status}`);
                        errors.push({ group: g, error: "Failed to create group", status: createResp.status });
                    }
                }
            } catch (err: any) {
                LOG.error(`handleRequest: exception processing group '${g}': ${err.message}`, { stack: err.stack });
                errors.push({ group: g, error: err.message });
            }
        }

        const groupIds = createdOrFoundGroups.map(k => ({ groupId: k.groupId, "roles": [], "appendRole": true }));
        const finalGroups = [...groupIds, { "groupId": "CIDAAS_USERS", "roles": ["USER"] }]
        LOG.info(`handleRequest: final groupIds=${JSON.stringify(groupIds)}`);

        const userPayload = {
            client_id: default_app_client_id,
            userEntity: {
                provider: "self",
                "userStatus": "VERIFIED",
                "email_verified": true,
                email,
                family_name: familyName || "",
                given_name: givenName || "",
                groups: finalGroups,
                "customFields": { companyName: companyName }
            },
            "notify_user": true,
            "primaryType": "email",
            redirect_uri: `https://${domain}/user-profile/editprofile`,
            response_type: "code"
        };
        LOG.info(`handleRequest: creating user with payload=${JSON.stringify(userPayload)}`);

        let userResp;
        try {
            userResp = await fetch(userUrl, {
                method: "POST",
                headers: { Authorization: authHeader, "Content-Type": "application/json" },
                body: JSON.stringify(userPayload),
            });
            LOG.info(`handleRequest: user service response status=${userResp.status}`);
        } catch (err: any) {
            LOG.error(`handleRequest: user fetch exception: ${err.message}`, { stack: err.stack });
            return res.status(500).json({ error: "User creation fetch failed", detail: err.message });
        }
        let userBody: any = null;
        try {
            userBody = await userResp.json();
            LOG.info(`handleRequest: user service response body=${JSON.stringify(userBody)}`);
        } catch (err: any) {
            LOG.warn(`handleRequest: failed to parse user service JSON: ${err.message}`);
        }

        if (userResp.status === 401) {
            LOG.error("handleRequest: unauthorized when creating user");
            return res.status(401).json({ error: "Unauthorized when creating user" });
        }
        if (userResp.status >= 400) {
            LOG.error(`handleRequest: failed to create user status=${userResp.status} body=${JSON.stringify(userBody)}`);
            return res.status(userResp.status).json({ error: "Failed to create user", status: userResp.status, body: userBody });
        }
        const finalMessage = `User account for ${givenName} created successfully.
        Email: ${email}\n
        Group(s): ${groupIds.map(k=>k.groupId).join(',')}
        An email has been send to the user.
        `
        LOG.info(`handleRequest: succeeded for email=${email}`);
        return res.json({ email, groups: groupIds, groupsInfo: createdOrFoundGroups, userServiceResponse: userBody, error: errors.length ? errors : undefined, message:finalMessage });
    } catch (err: any) {
        LOG.error("handleRequest: unexpected error", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: "Internal Server Error", detail: err.message });
    }
}