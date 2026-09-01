const axios = require('axios');

// Main function to handle the event and process Cidaas version
module.exports = async function (event, ctx, config, vars) {
  try {
    // Parse the incoming event JSON
    const myEvent = typeof event === 'string' ? JSON.parse(event) : event;
    console.log("Inside getCidaasVersion transformation", myEvent);

    if (!myEvent?.tenantKey) {
      throw new Error('Invalid event data: Missing tenantKey');
    }

    // Retrieve access token
    const accessToken = await getCidaasToken(config.qa_base_url, config.qa_client_id, config.qa_client_secret);

    if (!accessToken) {
      throw new Error('Failed to retrieve access token');
    }

    // Fetch the Cidaas version from CMI
    const cidaasVersion = await getCidaasVersion(config.cmi_dev_base_url, accessToken, myEvent.tenantKey);

    if (!cidaasVersion) {
      throw new Error('Cidaas version not found');
    }

    myEvent.cidaasVersion = cidaasVersion;
    console.log("Cidaas Version:", cidaasVersion);

    // Return the updated event object
    return myEvent;
  } catch (error) {
    console.error("Error in processing: ", error);
    return { error: error.message };
  }
};

// Fetch access token
async function getCidaasToken(baseURL, clientId, clientSecret) {
  try {
    const payload = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;
    
    const response = await axios.post(`${baseURL}/token-srv/token`, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = response?.data?.access_token;
    if (!accessToken) {
      throw new Error('Access token not received');
    }

    console.log('Token successfully fetched');
    return accessToken;
  } catch (error) {
    throw new Error(`Failed to generate Cidaas access token: ${error.response?.data?.error_description || error.message}`);
  }
}

// Function to get Cidaas version
async function getCidaasVersion(apiURL, token, tenantKey) {
  try {
    const response = await axios.post(`${apiURL}/management-srv/tenant/search`, { tenantKey }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = response?.data;

    // Validate response and extract Cidaas version
    if (!responseData?.success || !responseData?.data?.tenantList?.length) {
      throw new Error("Failed to get Cidaas version or tenant not found");
    }

    return responseData.data.tenantList[0].cidaasVersion;
  } catch (error) {
    throw new Error(`Error while getting Cidaas version: ${error.response?.data?.error || error.message}`);
  }
}
