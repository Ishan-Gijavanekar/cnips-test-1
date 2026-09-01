import fetch from "node-fetch";

const GITLAB_API = "https://gitlab.widas.de/api/v4";

// --- Helper: GitLab API GET ---
async function getJson(url, token) {
  const res = await fetch(url, {
    headers: { "PRIVATE-TOKEN": token },
  });
  if (!res.ok) throw new Error(`GitLab API error ${res.status}: ${url}`);
  return res.json();
}

// --- Helper: GitLab API POST (for ticket creation) ---
async function postJson(url, data, token, LOG) {
  LOG.debug("POST payload:", JSON.stringify(data, null, 2));
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "PRIVATE-TOKEN": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  LOG.debug("POST response:", text);
  if (!res.ok) {
    throw new Error(`GitLab API POST error ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

// --- Get project ID dynamically from path ---
async function getProjectId(projectPath, token, LOG) {
  const url = `${GITLAB_API}/projects/${encodeURIComponent(projectPath)}`;
  const project = await getJson(url, token);
  LOG.info(`Resolved project ID: ${project.id} for ${projectPath}`);
  return project.id;
}

// --- Extract version from labels ---
function extractVersionFromLabels(labels) {
  const versionLabel = labels.find(
    (l) =>
      l.toLowerCase().startsWith("version:") ||
      /^v?\d+\.\d+\.\d+/.test(l)
  );
  if (versionLabel) {
    if (versionLabel.toLowerCase().startsWith("version:")) {
      return versionLabel.replace(/version:/i, "").trim();
    }
    return versionLabel.trim();
  }
  return null;
}

// --- Extract version from description ---
function extractVersion(description) {
  if (!description) return null;
  const match = description.match(/cidaasVersion\s*\|?\s*v?([\d.]+)/i);
  return match ? match[1] : null;
}

// --- Build markdown summary ---
function buildMarkdown(version, tickets) {
  let md = `\n#### Version: ${version}\n`;
  md += "| Ticket ID | Title | Status | Priority | cidaasVersion |\n";
  md += "|-----------|-------|--------|----------|---------------|\n";

  tickets.forEach((issue) => {
    const priority =
      issue.labels.find((l) => ["Low", "Medium", "High"].includes(l)) || "-";
    const status = issue.state || "-";
    const issueVersion =
      extractVersionFromLabels(issue.labels) ||
      extractVersion(issue.description) ||
      "Unknown";

    md += `| ${issue.iid} | ${issue.title} | ${status} | ${priority} | ${issueVersion} |\n`;
  });

  return md;
}

// --- Ticket creation logic ---
async function createTicket({ title, description, labels = [], assignee_id = null, project_id, token, LOG }) {
  const url = `${GITLAB_API}/projects/${project_id}/issues`;

  if (typeof labels === "string") {
    labels = [labels];
  }

  const data = { title, description, labels };
  if (assignee_id) data.assignee_ids = [assignee_id];

  const issue = await postJson(url, data, token, LOG);
  LOG.info(`✅ Created ticket: #${issue.iid} - ${issue.title}`);
  return issue;
}

// --- MAIN EXECUTION ---
export async function execute(event, config, vars, LOG) {
  try {
    LOG.info(`Executing event: ${event}`);
    LOG.debug(`Config: ${JSON.stringify(config)}`);
    LOG.debug(`Vars: ${JSON.stringify(vars)}`);
    LOG.info(`Event details: %s, Config: %j, Vars: %j`, event, config, vars);

    const TOKEN = vars.gitlab_token || process.env.GITLAB_TOKEN;
    const PROJECT_PATH =
      config.project_path || "cidaas-v2/service-management/cidaas-support";

    if (!TOKEN) throw new Error("Missing GitLab token");

    // 1. Resolve project ID
    const projectId = await getProjectId(PROJECT_PATH, TOKEN, LOG);

    // 2. Fetch existing issues
    const issues = await getJson(
      `${GITLAB_API}/projects/${encodeURIComponent(PROJECT_PATH)}/issues?state=opened&per_page=100`,
      TOKEN
    );

    // 3. Group by version
    const versionGroups = {};
    for (const issue of issues) {
      const version =
        extractVersionFromLabels(issue.labels) ||
        extractVersion(issue.description) ||
        "Unknown";

      if (!versionGroups[version]) versionGroups[version] = [];
      versionGroups[version].push(issue);
    }

    // 4. Build markdown
    let finalMarkdown = "# Tickets Grouped by cidaasVersion\n";
    for (const [version, tickets] of Object.entries(versionGroups)) {
      finalMarkdown += buildMarkdown(version, tickets);
    }

    // 5. Create summary ticket
    await createTicket({
      title: "Summary of Issues Grouped by cidaasVersion",
      description: finalMarkdown,
      labels: "Metrics Measurment",
      project_id: projectId,
      token: TOKEN,
      LOG,
    });

    LOG.info("✅ Summary ticket created with full table content.");
  } catch (error) {
    LOG.error(`❌ Error executing event ${event}:`, error);
    throw error;
  }
}
