const axios = require("axios");
module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) { /* required */
    let userInfo = event.data.userInfo;
    let updateUserResponse = await updateFreshDeskData(event,config)
    console.log("updateUserResponse set to: ", updateUserResponse);
    event.data.updateUserResponse = updateUserResponse;
    console.log("DEST:FD_DEST_UPDATECUSTOMFIELD, EVENT: ", event);
    return event;
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}

async function updateFreshDeskData(event, config){
    let responseObject = {
        updatedCidaas: false,
        data: null,
        error: null
    };
    try {

        let updateObject = {
            sub: event.data.userData.identity.sub,
            provider:event.data.userData.identity.provider
        };

        updateObject = getCustomData(event, updateObject);
        if( !updateObject.customFields){
            console.log("No cidaas update required. customFields does not present");
            return responseObject;
        }
        console.log("Update Object: ", updateObject);
        let URL = config.base_url + '/users-srv/user/' + event.data.userData.identity.sub;
        let response = await axios.put(URL,
            updateObject, {
                headers: {
                    'Authorization': 'Bearer ' + event.data.access_token,
                    'Content-Type': 'application/json'
                }
            });
        if (!response || !response.data || response.status !== 200) {
            console.log('error updating customfields to cidaas. response status', response.status, " response data: ", response.data);
            responseObject.error = 'non OK response status ' + response.status;
            return responseObject;
        }
        responseObject.updatedCidaas = true;
        responseObject.data = response.data;
        return responseObject;
    } catch (err){
        console.log('error updating freshdesk customfields to cidaas', err);
        responseObject.error = err;
        return responseObject;
    }
    
}

function getCustomData(event, updateObject){
    if(event.data && event.data.contactResponse && event.data.contactResponse.createContact
        && event.data.contactResponse.data){
        updateObject.customFields = {
            freshdeskid: {
                fieldKey: 'freshdeskid',
                value: String(event.data.contactResponse.data.id)
            }
        };
        updateObject.groups = [{
            sub: event.data.userData.identity.sub,
            groupId: config.groupId,
            roles: ['CONTACT'],
            appendRole: true
        }]
    } else if(event.data && event.data.agentResponse && event.data.agentResponse.createAgent
        && event.data.agentResponse.data){
        updateObject.customFields = {
            freshdeskid: {
                fieldKey: 'freshdeskid',
                value: String(event.data.agentResponse.data.id)
            }
        };
    }
    return updateObject;
}