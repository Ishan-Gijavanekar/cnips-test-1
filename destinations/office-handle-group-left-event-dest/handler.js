const axios = require("axios");
module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) { /* required */
        let updateResponse = await handleGroupLeftEventDest(event, config);
        event.updateCidaasResponse = updateResponse;
        console.log("updateResponse: ", updateResponse);
        console.log("DESTINATION:handleGroupLeftEventDest, EVENT: ", event);
        return event;
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}

async function handleGroupLeftEventDest(event, config){
    let responseObject = {
        updatedCidaas: false,
        data: null,
        error: null
    };
    try {
        if(!event.data.licenseResponse || !event.data.licenseResponse.provisionedLicense){
            console.log('No Cidaas Update needed. Reason: license provisioning not successful');
            return responseObject;
        }
        let updateObject = {
            sub: event.data.userInfo.identity.sub,
            provider:event.data.userInfo.identity.provider,
            userStatus:'BLOCKED'
        };
        let URL = config.base_url + '/users-srv/user/' + event.data.userData.identity.sub;
        let response = await axios.put(URL,
            updateObject, {
                headers: {
                    'Authorization': 'Bearer ' + event.data.access_token,
                    'Content-Type': 'application/json'
                }
            });
        if (!response || !response.data || response.status !== 200) {
            console.log('error updating user blocked status to cidaas. response status', response.status, " response data: ", response.data);
            responseObject.error = 'non OK response status ' + response.status;
            return responseObject;
        }
        responseObject.updatedCidaas = true;
        responseObject.data = response.data;
        return responseObject;
    } catch (error){
        console.log('error handling Office Groupleft event  update to cidaas', err);
        responseObject.error = error;
        return responseObject;
    }

}