/**
 * Transformation Function Contract:
 * 
 * @param event - JSON object representing the event data
 * @param config - Transformation configuration (read-only)
 * @param vars - Global variables object (modify properties directly)
 * @param LOG - Logger instance for this execution
 * 
 * IMPORTANT: 
 * - DO NOT use require statement, always use import.
 * - Modify vars properties directly: vars.myProperty = newValue
 * - DO NOT reassign vars: vars = newObject (this won't work)
 * - Always return your transformaed event as javascript objects, otherwise system will stop processing with error message.
 * - You can also use typescript if you want to enforce types
 * - Just add types to the function parameters and import Logger from "@cnips/simplelog"
 * 
 * Example:
 * ```typescript
 * import { Logger } from "@cnips/simplelog";
 * 
 * interface MyEvent {
 *    type: string;
 *    timestamp: Date;
 * }
 * 
 * interface TransformedEvent {
 *   processed: boolean;    
 *   originalEvent: MyEvent;
 *   timestamp: Date; 
 * }
 * 
 * interface Config {
 *   base_url: string;
 *   api_key: string;
 * }
 * 
 * interface Veriables {
 *  access_token: string;
 * }
 * 
 * export async function execute(event: MyEvent, config: Config, vars: Variables, LOG: Logger): Promise<TransformedEvent>
 * ```
 */
export async function execute(event, config, vars, LOG) {
    try {
        LOG.info("Received GitLab webhook event");
        LOG.debug(`Full event payload: ${JSON.stringify(event, null, 2)}`);

        // Identify the type of GitLab webhook
        const eventType = event.object_kind;
        LOG.info(`GitLab event type: ${eventType}`);

        // GitLab personal or project access token
        const token = config.gitlab_token
        if (!token) throw new Error("Missing GitLab API token (gitlab_token).");

        // Base URL (e.g., https://gitlab.com or your self-hosted instance)
        const baseUrl = "https://gitlab.widas.de/";

        let issueIid;
        let projectId;

        if (eventType === "issue") {
            issueIid = event.object_attributes.iid;
            projectId = event.project.id;
            LOG.info(`Issue event detected (action: ${event.object_attributes.action})`);
        } else if (eventType === "note" && event.object_attributes.noteable_type === "Issue") {
            issueIid = event.issue.iid;
            projectId = event.project.id;
            LOG.info(`Comment added to issue IID ${issueIid}`);
        } else {
            LOG.info("Event is not related to an issue or note on issue. Skipping further processing.");
            return { processed: false, reason: "Not an issue/note event", event };
        }
        vars["CNIPSAGENTGITLABPROJECTID"] = `${projectId}`
        vars["CNIPSAGENTGITLABISSUEID"] = `${issueIid}`
        LOG.info(vars,"All vars")
        // --- Fetch issue details from GitLab API ---
        const issueUrl = `${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`;
        const commentsUrl = `${issueUrl}/notes`;

        LOG.info(`Fetching issue details from: ${issueUrl}`);
        LOG.info(`Fetching issue comments from: ${commentsUrl}`);

        const headers = { "PRIVATE-TOKEN": token };

        // Fetch issue info
        const issueResp = await fetch(issueUrl, { headers });
        const issueData = await issueResp.json();

        // Fetch comments
        const commentsResp = await fetch(commentsUrl, { headers });
        const commentsData = await commentsResp.json();

        LOG.info(`Issue title: ${issueData.title}`);
        LOG.info(`Description: ${issueData.description}`);
        LOG.info(`Total comments: ${commentsData.length}`);

        commentsData.forEach((note, i) => {
            LOG.debug(`Comment ${i + 1} by ${note.author.username}: ${note.body}`);
        });

        // Return transformed event
        const transformedEvent = {
            processed: true,
            eventType,
            projectId:projectId,
            issueId:issueIid,
            issue: {
                id: issueData.id,
                iid: issueData.iid,
                title: issueData.title,
                description: issueData.description,
                web_url: issueData.web_url,
                comments: commentsData.map(c => ({
                    author: c.author.username,
                    body: c.body,
                    created_at: c.created_at
                }))
            },
            timestamp: new Date(),
            originalEvent: event
        };
        // LOG.info(transformedEvent)
        return transformedEvent;

    } catch (error) {
        LOG.error(`Error executing event: ${error.message}`, error);
        throw error;
    }
}