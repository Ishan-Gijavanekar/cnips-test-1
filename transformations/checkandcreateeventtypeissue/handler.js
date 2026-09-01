const axios = require('axios');

module.exports = async function (event, ctx, config, vars) {
  console.log("Inside transformation");

  try {
    // Parse the incoming event JSON
    const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

    // Check if gitlabSearchResponse
    if (myEvent.gitlabSearchResponse && Object.keys(myEvent.gitlabSearchResponse).length === 0) {

      const title = myEvent.gitlabSearchData?.title;

      const webhookJSON = generateWebhookJSON(myEvent);

      const description = `### Description:
We encountered an issue while processing the webhook event.

### Webhook Event Request Body:
\`\`\`json
${webhookJSON}
\`\`\`

### Error Message:
\`\`\`json
${myEvent.errorMsg}
\`\`\`

### Instance Info:
- **Tenant Key**: ${myEvent.tenantKey}
- **Cidaas Version**: ${myEvent.cidaasVersion}
`;

      console.log("No existing issue found. Creating a new GitLab issue...");
      await createGitlabIssue(myEvent, config, title, description);

      return myEvent;
    } else {
      myEvent.gitlabCreateEventTypeResposne = {
        issueId: myEvent.gitlabSearchResponse.iid,
        projectId: myEvent.gitlabSearchResponse.project_id,
        web_url: myEvent.gitlabSearchResponse.web_url
      }
      console.log("GitLab issue already exists. Overview Info assigned.");
      return myEvent;
    }
  } catch (error) {
    console.error("Error in transformation:", error);
    return { error: error.message, event };
  }
};

// Function to generate formatted JSON for the webhook event
function generateWebhookJSON(event) {
  const filteredEvent = {
    eventtype: event?.eventtype,
    createTime: event?.createTime,
    client_id: event?.client_id,
    tenantKey: event.tenantKey,
    actorId: event?.actorId,
    metaData: event?.metaData,
    objectId: event?.objectId,
    objectType: event?.objectType,
    sub: event?.sub,
    userId: event?.userId
  };
  return JSON.stringify(filteredEvent, null, 2);
}

// CreateGitlabIssue creates a new GitLab issue
async function createGitlabIssue(event, config, title, description) {
  try {
    const url = `${config.gitlabBaseUrl}/projects/${event.gitlabSearchData?.iid}/issues`;

    const requestBody = {
      title,
      description,
      labels: ["Status::ToDo", "Type::Automation"]
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        'PRIVATE-TOKEN': config.gitlabToken,
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 201) {
      throw new Error(`Failed to create issue. Status: ${response.status}, Response: ${JSON.stringify(response.data)}`);
    }

    const gitlabIssue = response.data;
    event.gitlabCreateEventTypeResposne = {
      issueId: gitlabIssue.iid,
      projectId: gitlabIssue.project_id,
      web_url: gitlabIssue.web_url
    };

    console.log(`GitLab issue created successfully. ID: ${gitlabIssue.iid}, Project ID: ${gitlabIssue.projectId}, URL: ${gitlabIssue.web_url}`);

    return event;
  } catch (error) {
    console.error(`Error creating GitLab issue: ${error.message}`);
    throw error;
  }
}
