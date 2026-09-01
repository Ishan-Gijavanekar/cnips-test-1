const axios = require('axios');

module.exports = {

  setup: function (config, vars) { /* optional */ },

  execute: async function (event, ctx, config, vars) { /* required */

  console.log("inside Issue update", event.data);
    try {
      // Validate input data
      if (!event || !event.data || !Array.isArray(event.data)) {
        throw new Error('Invalid or missing data in event');
      }

      // console.log("event.data", event.data);

      const gitlabToken = config.gitlabToken;
      const results = [];

      for (const issue of event.data) {
        const { ProjectId, IssueId, Labels, Comment, Requirement } = issue;

        console.log("inside for ", ProjectId, IssueId, Labels, Comment, Requirement );

        try {
          const headers = { headers: { 'PRIVATE-TOKEN': gitlabToken } };

          // Update labels if Requirement is false
          if (!Requirement && Array.isArray(Labels)) {
            await axios.put(`https://gitlab.widas.de/api/v4/projects/${ProjectId}/issues/${IssueId}`, {
              labels: Labels.join(',')
            }, headers);
            console.log(`Labels updated for Issue ${IssueId}`);
          }

          // Add comment if provided
          if (!Requirement && Comment) {
            await axios.post(`https://gitlab.widas.de/api/v4/projects/${ProjectId}/issues/${IssueId}/notes`, {
              body: Comment
            }, headers);
            console.log(`Comment added to Issue ${IssueId}`);
          }

          results.push({ IssueId, status: 'Success' });
        } catch (error) {
          console.error(`Error updating issue ${IssueId}:`, error?.response?.data?.message || error.message);
          results.push({ IssueId, status: 'Failed', error: error?.response?.data?.message || error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('General error:', error.message);
      return [];
    }
  },

  teardown: function (config, vars) { /* optional */ }
};
