const axios = require('axios');


// Main function to handle the event
module.exports = async function (event, ctx, config, vars) {
  try {
    // Parse the incoming event JSON
    const myEvent = typeof event === 'string' ? JSON.parse(event) : event;
    console.log("Inside GetWebhookRequiredAttributes transformation");

    // Fetch webhook attributes
    const webhookAttributes = await fetchWebhookAttributes(config);
    myEvent.WebhookAttributes = webhookAttributes;
    console.log("Webhook Attributes Fetched Successfully");

    // Return the updated event as JSON string
    return myEvent;
  } catch (error) {
    console.error("Error in processing: ", error);
    return JSON.stringify({ error: error.message });
  }
};

// Fetch webhook attributes from GitLab
async function fetchWebhookAttributes(config) {
  const gitlabBaseUrl = config.gitlabBaseUrl;
  const token = config.gitlabToken;
  const path = "/3128/repository/files/resources%2Fseeding%2Ffact_eventtypes.json/raw?ref=master";
  const gitlabAPIUrl = `${gitlabBaseUrl}${path}`;

  try {
    const response = await axios.get(gitlabAPIUrl, {
      headers: { 'PRIVATE-TOKEN': token }
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    console.log("response GetWebhookRequiredAttributes");
    return response.data;
  } catch (error) {
    throw new Error(`Error while fetching webhook attributes: ${error.response?.data?.error || error.message}`);
  }
}
