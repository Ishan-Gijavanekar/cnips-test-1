const axios = require("axios");
module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) { /* required */
        let updateResponse = await updateCidaas(event, config);
        event.updateCidaasResponse = updateResponse;
        console.log("updateResponse: ", updateResponse);
        console.log("DESTINATION:UpdateCidaasOffice, EVENT: ", event);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}

function getUpdateObjectWithOfficeData(event){
    let updateObject = {
        sub: event.data.userInfo.identity.sub,
        provider:event.data.userInfo.identity.provider
    };
    if(event && event.data && event.data.officeResponse &&
        event.data.officeResponse.userCreated && event.data.officeResponse.data.onPremisesImmutableId){
        updateObject.customFields = {
            immutableid: {
                fieldKey: 'immutableid',
                value: String(event.data.officeResponse.data.onPremisesImmutableId)
            }
        };
    } else {
        console.log('immutableid does not exist in the Office response');
    }
    console.log('Update Object: ', updateObject);
    return updateObject;
}

async function updateCidaas(event, config){
    let responseObject = {
        updatedCidaas: false,
        data: null,
        error: null
    };
    try {
        if (event.eventtype.toUpperCase() !== 'ACCOUNT_CREATED_WITH_CIDAAS_IDENTITY'
            && event.eventtype.toUpperCase() !== 'ACCOUNT_CREATED_WITH_SOCIAL_IDENTITY'){
            console.log('Cidaas update is not required for this event type');
            return responseObject;
        }
        let updateObject = getUpdateObjectWithOfficeData(event);
        if(updateObject && updateObject.customFields && Object.keys(updateObject.customFields).length != 0){
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
            console.log("No cidaas update required. Office customFields does not present");
            return responseObject;
        }
    } catch(err){
        console.log('error updating Office customfields to cidaas', err);
        responseObject.error = err;
        return responseObject;
    }

}