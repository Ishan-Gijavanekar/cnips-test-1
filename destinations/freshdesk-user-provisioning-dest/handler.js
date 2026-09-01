const axios = require("axios");
module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) { /* required */
        //let userInfo = event.data.userInfo;
        let updateUserResponse = await updateFreshDeskData(event,config)
        console.log("Incoming Config. freshdesk-user-provisioning-dest : ", config);
        event.data.updateUserResponse = updateUserResponse;
        console.log("DEST:freshdesk-user-provisioning-dest, EVENT: ", event);
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
            sub: event.data.userInfo.identity.sub,
            provider:event.data.userInfo.identity.provider
        };

        if(event.eventtype == 'ACCOUNT_CREATED_WITH_CIDAAS_IDENTITY'
            || event.eventtype == 'ACCOUNT_CREATED_WITH_SOCIAL_IDENTITY' || event.eventtype == 'GROUP_NEW_USER_ADDED'){
            updateObject = getCustomData(event, updateObject, config);
            if( !updateObject.customFields){
                console.log("No cidaas update required. customFields does not present");
                return responseObject;
            }
            //console.log("Update Object: ", updateObject);
            /*if(!config || !config.base_url){
                console.log('Config not found. Cidaas base_url set to qa.cidaas.de')
                config = {"base_url":"https://qa.cidaas.de"};
            }*/
            //console.log('Config at Destination Update Cidaas Customfield: ', config);
            let URL = config.base_url + '/users-srv/user/' + event.data.userInfo.identity.sub;
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
        } else if(event.eventtype == 'ACCOUNT_DELETED'){
            console.log('No Cidaas Update required for this event type. Type: ', event.eventtype);
            return responseObject;
        } else {
            console.log('No Cidaas Update required for this event type. Type: ', event.eventtype);
            return responseObject;
        }

    } catch (err){
        console.log('error updating freshdesk customfields to cidaas', err.message);
        responseObject.error = err;
        return responseObject;
    }

}

function getCustomData(event, updateObject, config){
    if(event.data && event.data.freshdeskResponse && event.data.freshdeskResponse.createContact
        && event.data.freshdeskResponse.data){
        updateObject.customFields = {
            freshdeskid: {
                fieldKey: 'freshdeskid',
                value: String(event.data.freshdeskResponse.data.id)
            }
        };
        updateObject.groups = [{
            sub: event.data.userInfo.identity.sub,
            groupId: config.groupId,
            roles: ['CONTACT'],
            appendRole: true
        }]
    } else if(event.data && event.data.freshdeskResponse && event.data.freshdeskResponse.createAgent
        && event.data.freshdeskResponse.data){
        updateObject.customFields = {
            freshdeskid: {
                fieldKey: 'freshdeskid',
                value: String(event.data.freshdeskResponse.data.id)
            }
        };
    }
    return updateObject;
}
