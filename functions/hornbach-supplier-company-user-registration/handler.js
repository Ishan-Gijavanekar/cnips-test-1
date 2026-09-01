// user-create-handler.js
// Pure JavaScript, CommonJS export

module.exports = async function (req, res, config) {
  /**
   * Expected input in req.body:
   * {
   *   token: string,
   *   givenName: string,
   *   familyName: string,
   *   email: string,
   *   groups: string,            // comma separated
   *   companyName?: string
   * }
   */

  const BAD_REQUEST = 400;

  // Helper greeting function
  function greeting(first, last) {
    const full = `${(first || "").trim()} ${(last || "").trim()}`.trim();
    return full || "User";
  }

  try {
    const {
      token,
      givenName,
      familyName,
      email,
      groups: groupsRaw,
      companyName,
    } = req.body || {};

    // basic validation
    if (!token || !email) {
      return res.status(BAD_REQUEST).json({ error: "token and email are required" });
    }

    const domain = "qa.cidaas.de"

    // normalize and split groups
    const groupsList = (groupsRaw || "")
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    // deduplicate groups
    const uniqueGroups = Array.from(new Set(groupsList));

    const authHeader = `Bearer ${token}`;
    const createdOrFoundGroups = [];
    const errors = [];

    // helper to check group existence
    async function checkGroup(groupId) {
      const url = `https://${domain}/groups-srv/usergroups?groupId=${encodeURIComponent(groupId)}`;
      const resp = await fetch(url, {
        method: "GET",
        headers: { Authorization: authHeader },
      });

      const status = resp.status;
      if (status === 200) {
        let body = null;
        try {
          body = await resp.json();
        } catch (e) {}
        return { found: true, data: body, status: 200 };
      } else if (status === 204) return { found: false, status: 204 };
      else if (status === 401) return { found: false, status: 401 };
      else if (status === 404) return { found: false, status: 404 };
      else return { found: false, status };
    }

    // helper to create group
    async function createGroup(groupId, groupName) {
      const url = `https://${domain}/groups-srv/usergroups`;
      const body = {
        groupId: groupId,
        groupName: groupName || groupId,
        parentId: "root",
      };

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const status = resp.status;
      let json = null;
      try {
        json = await resp.json();
      } catch (e) {}

      return { status, body: json };
    }

    // ensure groups exist
    for (const g of uniqueGroups) {
      try {
        const check = await checkGroup(g);

        if (check.status === 401) {
          return res.status(401).json({ error: "Unauthorized when calling groups service" });
        }

        if (check.found) {
          const data = check.data && check.data.data ? check.data.data : check.data;
          createdOrFoundGroups.push({
            groupId: g,
            parentId: data?.parentId ?? null,
            groupName: data?.groupName ?? g,
          });
        } else {
          const createResp = await createGroup(g, g);

          if (createResp.status === 200 || createResp.status === 201) {
            const returned = createResp.body;
            const data = returned && returned.data ? returned.data : returned;

            createdOrFoundGroups.push({
              groupId: g,
              parentId: data?.parentId ?? "root",
              groupName: data?.groupName ?? g,
            });
          } else if (createResp.status === 401) {
            return res.status(401).json({ error: "Unauthorized when creating group", group: g });
          } else {
            errors.push({ group: g, error: "Failed to create group", status: createResp.status });
          }
        }
      } catch (err) {
        errors.push({ group: g, error: String(err && err.message ? err.message : err) });
      }
    }

    // create the user
    const userUrl = `https://${domain}/users-srv/user/create/byadmin`;
    const groupIds = createdOrFoundGroups.map((g) => ({groupId:g.groupId}));

    const userPayload = {
      userEntity: {
        email,
        first_name: familyName || "",
        given_name: givenName || "",
        groups: groupIds,
      },
    };

    const userResp = await fetch(userUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userPayload),
    });

    const userStatus = userResp.status;
    let userBody = null;

    try {
      userBody = await userResp.json();
    } catch (e) {}

    if (userStatus === 401) {
      return res.status(401).json({ error: "Unauthorized when creating user" });
    }

    if (userStatus >= 400) {
      return res.status(userStatus).json({
        error: "Failed to create user",
        status: userStatus,
        body: userBody,
      });
    }


    return res.json({
      message: `Hello ${greeting(givenName, familyName)}.`,
      email,
      groups: groupIds,
      groupsInfo: createdOrFoundGroups,
      userServiceResponse: userBody,
      errors: errors.length ? errors : undefined,
    });

  } catch (err) {
    return res.status(500).json({
      error: "internal_error",
      detail: String(err && err.message ? err.message : err),
    });
  }
};
