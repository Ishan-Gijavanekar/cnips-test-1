const axios = require("axios");
module.exports = async function (event, ctx, config) {
    console.log("TRANSFORMATION:CREATECOMPANY: CONFIG:", config);
    let freshdeskResponse = await createCompany(event, config);
    event.data.freshdeskResponse = freshdeskResponse;
    //console.log("freshdesk Response: ", freshdeskResponse);
    console.log("TRANSFORMATION:CREATECOMPANY: EVENT:", event);
    return event;
}

async function createCompany(event, config){
    let responseObject = {
        createdCompany: false,
        data: null,
        error: null
    }
    try {
        let groupId = event.data.groupInfoResponse.data.groupId;
        let groupName = event.data.groupInfoResponse.data.groupName;
        let response = await axios.post(config.freshdesk_url +`/api/v2/companies/`,
            {
                name: groupName
            },
            {
                auth: {
                    username: config.api_key,
                    password: 'X' // 'X' as a placeholder for the password
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        if (!response || !response.data || response.status !== 201) {
            console.log('error creating company. response status', response.status, " response data: ", response.data);
            responseObject.error = response
            return responseObject;
        }
        responseObject.data = response.data;
        responseObject.createdCompany = true;
        return responseObject;
    } catch (error){
        responseObject.error = error;
        console.log("TRANSFORMATION:CREATECOMPANY ERROR: ", error.message);
        return responseObject;
    }
}