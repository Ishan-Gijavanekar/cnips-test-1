const axios = require('axios');

module.exports = async function (event, ctx, config, vars) {
  console.log('Starting GitLab issue search...');

  try {
    // Parse the incoming event JSON
    const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

    if (!myEvent.gitlabSearchData?.title || !myEvent.gitlabSearchData?.state || !myEvent.gitlabSearchData?.iid || !config.gitlabBaseUrl || !config.gitlabToken) {
      throw new Error('Missing required data for GitLab search');
    }

    // Perform GitLab issue search
    const gitlabSearchResponse = await searchGitLabIssue(myEvent, config);

    myEvent.gitlabSearchResponse = gitlabSearchResponse;

    return myEvent;

  } catch (error) {
    console.error("Error in transformation:", error);
    return { error: error.message };
  }
};

async function searchGitLabIssue(myEvent, config) {
  const { title, state, iid } = myEvent.gitlabSearchData;

  // Construct the search URL
  const quotedSearch = encodeURIComponent(`"${title}"`);
  const stateQuery = encodeURIComponent(state);

  const url = `${config.gitlabBaseUrl}/projects/${iid}/issues?search=${quotedSearch}&state=${stateQuery}`;
  console.log('Final URL:', url);

  try {
    const response = await axios.get(url, {
      headers: {
        'PRIVATE-TOKEN': config.gitlabToken,
      },
    });

    if (response.data && response.data.length > 0) {
      // console.log('Issue found:', response.data[0]);
      return {
        title: response.data[0].title,
        state: response.data[0].state,
        iid: response.data[0].iid,
        project_id: response.data[0].project_id,
        web_url: response.data[0].web_url,
      };
    } else {
      console.log('No matching issue found.');
      return {};
    }
  } catch (error) {
    console.error('Error searching GitLab issue:', error.message);
    return {};
  }
}
