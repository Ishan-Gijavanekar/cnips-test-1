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
/**
 * Transformation Function:
 * Posts a comment to a GitLab issue if `reply` is true.
 *
 * Expected event (as string):
 * {
 *   "reply": true,
 *   "response": "This is my comment",
 *   "projectId": 123,
 *   "issueId": 45
 * }
 */

export async function execute(event, config, vars, LOG) {
  try {
    LOG.info("Received event string")
    
    const parsedEvent = typeof event === "string" ? JSON.parse(event.replace(/^\s*```(?:\s*json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim()) : event;
    LOG.info(`Received event: ${JSON.stringify(parsedEvent, null, 2)}`);


    
    let newResponse = JSON.parse(parsedEvent['response'].replace(/^\s*```(?:\s*json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim())
    LOG.info("response from json loads", newResponse, typeof newResponse)
    LOG.info(newResponse.reply, " reply in new response")
    let reply = newResponse.reply
    let response = newResponse.response
    
    
    LOG.info(vars,"All vars, post agent")
    // if (!projectId || !issueId) {
    //   throw new Error("Missing required fields: projectId or issueId");
    // }
    const projectId = vars["CNIPSAGENTGITLABPROJECTID"]
    const issueId = vars["CNIPSAGENTGITLABISSUEID"]
    
    LOG.info(`reply = ${reply}, response = ${response}`);
    LOG.info(`Target issue: Project ID = ${projectId}, Issue IID = ${issueId}`);

    const token = config.gitlab_token || vars.gitlab_token;
    LOG.info(token.length,"token is present")
    const baseUrl = "https://gitlab.widas.de/";

    if (!token) {
      throw new Error("Missing GitLab API token (gitlab_token).");
    }

    let commentResponse = null;
    if (reply) {
      const commentUrl = `${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}/issues/${issueId}/notes`;
      const body = { body: `[CNIPS AGENT] ${response}` };

      LOG.info(`Posting comment to GitLab: ${commentUrl}`);
      LOG.debug(`Request body: ${JSON.stringify(body)}`);

      const res = await fetch(commentUrl, {
        method: "POST",
        headers: {
          "PRIVATE-TOKEN": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to post comment: ${res.status} - ${errorText}`);
      }

      commentResponse = await res.json();
      LOG.info(`Comment successfully posted to issue #${issueId}`);
      LOG.debug(`GitLab API Response: ${JSON.stringify(commentResponse, null, 2)}`);
    } else {
      LOG.info("reply=false → Skipping comment post.");
    }

    return {
      processed: true,
      replied: reply,
      projectId,
      issueId,
      gitlabCommentResponse: commentResponse,
      timestamp: new Date(),
      originalEvent: parsedEvent
    };

  } catch (error) {
    LOG.info(event)
    LOG.error(`Error executing transformation: ${error.message}`, error);
    throw error;
  }
}
