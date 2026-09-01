const axios = require("axios");
module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) {   
    let cidaaResponse = await updateCidaas(event, config);
    console.log("updateUserResponse set to: ", cidaaResponse);
    event.data.updateUserResponse = cidaaResponse;
    console.log("DEST:GL-UPDATE-USER-IN-CIDAAS-DEST, EVENT:", event);
    return event;
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}

async function updateCidaas(event, config){
    let responseObject = {
        updatedCidaas: false,
        data: null,
        error: null
    };
    try {
        let updateObject = getUpdateObjectWithGitlabData(event);
        if(updateObject && updateObject.customFields){
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
        } else {
            console.log("No cidaas update required. customFields does not present");
            return responseObject;
        }

    } catch(err){
        console.log('error updating Gitlab customfields to cidaas', err);
        responseObject.error = err;
        return responseObject;
    }

}

function getUpdateObjectWithGitlabData(event){
    let updateObject = {
        sub: event.data.userData.identity.sub,
        provider:event.data.userData.identity.provider
    };

    if(event && event.data && event.data.gitlabResponse &&
        event.data.gitlabResponse.createGitlabUser && event.data.gitlabResponse.data.id){
        updateObject.customFields = {
            gitlabid: {
                fieldKey: 'gitlabid',
                value: String(event.data.gitlabResponse.data.id)
            }
        };
    }
    return updateObject;
}