const axios = require('axios');

module.exports = async function (event, ctx, config, vars) {
  console.log("Inside transformation");

  try {
    // Parse the incoming event JSON
    const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

    // Validate tenantKeya and cidaasVersion required fields
    if (!myEvent.tenantKey || !myEvent.cidaasVersion) {
      throw new Error('Missing required fields: tenantKey and/or cidaasVersion');
    }
    console.log(myEvent.tenantKey, myEvent.cidaasVersion);


    // Check if project_id and iid  exists 
    if (myEvent.gitlabSearchResponse?.project_id && myEvent.gitlabSearchResponse?.iid) {
      myEvent.gitlabEventOverviewInfo = {
        issueId: myEvent.gitlabSearchResponse.iid,
        projectId: myEvent.gitlabSearchResponse.project_id
      };
      console.log("GitLab issue already exists. Overview Info assigned.");

      return myEvent

    } else {
      const updatedEvent = await createGitlabIssue(myEvent, config);

      return updatedEvent;
    }

  } catch (error) {
    console.error("Error in transformation:", error);
    return { error: error.message, event };
  }
};

// CreateGitlabIssue creates a new GitLab issue
async function createGitlabIssue(event, config) {
  try {
    const url = `${config.gitlabBaseUrl}/projects/${event.gitlabSearchData.iid}/issues`;
    const title = `[Webhook Attributes Automation] Event Overview Table ${event.cidaasVersion} (${event.tenantKey})`;
    const tableRows = buildTableRows(event.WebhookAttributes);

    // console.log(tableRows);

    const description = `## **Summary:**
This ticket tracks the status of webhook events, including success and failure cases for Cidaas version ${event.cidaasVersion}. If an event fails, a GitLab issue will be created in the corresponding component, and the link to the issue will be available here.

## Instance Info:
- **Tenant Key**: ${event.tenantKey}
- **Cidaas Version**: ${event.cidaasVersion}

## Event Overview Table
${tableRows}

### **Explanation:**  
1. **Event Type:** Describes the type of event that occurred.  
2. **Status:** Represents whether the event processing was **Success**, **Failed**, or **Pending**.  
3. **Ticket Link:** If the event failed, a GitLab issue will be created to capture the error details. The issue link will be displayed here. If the event was successful, the column will remain empty.`;

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

    event.gitlabEventOverviewInfo = {
      issueId: gitlabIssue.iid,
      projectId: gitlabIssue.project_id
    };

    console.log(`GitLab issue created successfully. ID: ${gitlabIssue.iid},ID: ${gitlabIssue.projectId}, URL: ${gitlabIssue.web_url}`);

    return event;
  } catch (error) {
    console.log(`Error creating GitLab issue: ${error.message}`);
    throw error;
  }
}

// Helper function to build table rows
function buildTableRows(attributes) {
  if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
    return '| No attributes available |';
  }
  // console.log("buildTableRows",attributes);

  let table = '| Event Type | Status | Ticket Link |\n|-------------|---------|-------------|\n';
  for (const attribute of attributes) {
    table += `| ${attribute._id || 'N/A'} | Pending | - |\n`;
  }
  return table; 
}
