const axios = require('axios');

module.exports = {
  setup: function(config, vars) {
    console.log('Setting up connection...');
    // Optional setup logic if needed
  },

  execute: async function(event, ctx, config, vars) {
    console.log('THIS IS DESTINATION');

    try {
      const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

      // Extract projectId and issueIid from event or config
      const projectId = myEvent.gitlabIssueUpdateReq.projectId;
      const issueIid = myEvent.gitlabIssueUpdateReq.iid;

      if (!projectId || !issueIid) {
        throw new Error('Missing projectId or issueIid');
      }

      // Update issue data
      const updateData = {
        description: myEvent.gitlabIssueUpdateReq.description,
      };

      console.log('Updating GitLab issue with data:', updateData);

      // Perform the API call to update the issue
      const response = await axios.put(
        `${config.gitlabBaseUrl}/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`,
        updateData,
        {
          headers: {
            'PRIVATE-TOKEN': config.gitlabToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Issue updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating issue:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  teardown: function(config, vars) {
    console.log('Tearing down connection...');
    // Optional cleanup logic if needed
  }
};
