const axios = require('axios');

module.exports = async function (config) {

  console.log('Initial Config:', JSON.stringify(config, null, 2));

  // Parse labels if they are in JSON string format
  let labels = config.labels;
  try {
    if (typeof labels === 'string') {
      labels = JSON.parse(labels);
    }
  } catch (error) {
    console.error('Error parsing labels:', error);
    labels = [];
  }

  // Convert labels to GitLab compatible format
  labels = Array.isArray(labels) ? labels.join(',') : labels;
  const state = config.state || 'opened';
  const per_page = 100;

  // Function to fetch all issues with pagination using Promises
  const fetchAllIssues = () => {
    return new Promise(async (resolve, reject) => {
      const allIssues = [];
      let page = 1;

      try {
        const fetchPage = async (page) => {
          const apiUrl = `${config.gitlabBaseUrl}/projects/${config.projectId}/issues?labels=${labels}&state=${state}&page=${page}&per_page=${per_page}`;
          // const apiUrl = `${config.gitlabBaseUrl}/projects/${config.projectId}/issues/855`;
          console.log('API URL:', apiUrl);

          const response = await axios.get(apiUrl, {
            headers: { 'PRIVATE-TOKEN': config.gitlabToken }
          });

          console.log('Response Status:', response.status);
          console.log('Response Data:', JSON.stringify(response.data, null, 2));

          return response.data;
        };

        let results;
        do {
          results = await fetchPage(page);
          allIssues.push(...results);
          page++;
        } while (results.length > 0);

        resolve(allIssues);
      } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
        reject(`Failed to fetch issues: ${error.message}`);
      }
    });
  };

  // Function to split issues into packets of 5
  const splitIssuesIntoPackets = (issues) => {
    const packets = [];
    const maxIssuesPerPacket = 5;

    for (let i = 0; i < issues.length; i += maxIssuesPerPacket) {
      const packet = issues.slice(i, i + maxIssuesPerPacket);
      packets.push({ data: packet });
    }

    return packets;
  };

  try {
    console.log('Fetching all issues from GitLab with pagination using Promises...');
    const issues = await fetchAllIssues();

    if (!issues || issues.length === 0) {
      console.log('No issues found matching the criteria.');
      return [];
    }

    console.log(`Total Issues Retrieved: ${issues.length}`);
    const packets = splitIssuesIntoPackets(issues);

    console.log(`Total Packets Created: ${packets.length}`);
    return packets;
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
