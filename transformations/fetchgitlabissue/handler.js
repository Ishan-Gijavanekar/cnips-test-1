const axios = require('axios');

module.exports = async function (event, ctx, config, vars) {
  console.log("Inside FetchGitlabIssue transformation");

  try {
    const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

    // Fetch issue details from GitLab
    const issueDetails = await fetchGitlabIssue(myEvent, config);

    // console.log("Fetched GitLab Issue Details:", issueDetails);

    // Attach the issue details to the event
    myEvent.fetchGitlabResposne = issueDetails;

    // console.log("myEvent.fetchGitlabResposne",myEvent.fetchGitlabResposne);
    
    return myEvent;
  } catch (err) {
    console.error("Error processing event:", err.message);
    throw err;
  }
};

// Function to get GitLab issue details
async function fetchGitlabIssue(event, config) {
  try {
    if (!event?.fetchGitlabReqData?.project_id || !event?.fetchGitlabReqData?.iid) {
      throw new Error("Missing 'project_id' or 'iid' in fetchGitlabReqData.");
    }

    const url = `${config.gitlabBaseUrl}/projects/${event.fetchGitlabReqData.project_id}/issues/${event.fetchGitlabReqData.iid}`;
    console.log(`Fetching issue from URL: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'PRIVATE-TOKEN': config.gitlabToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching GitLab issue details:", error.response?.data || error.message);
    throw error;
  }
}
