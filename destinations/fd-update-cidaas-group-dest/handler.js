const axios = require("axios");
module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) { /* required */
        let updateCidaasResponse = await UpdateCidaasGroup(event, config);
        event.data.updateCidaasResponse = updateCidaasResponse;
        //console.log("freshdesk Response: ", freshdeskResponse);
        console.log("DESTINATION:UpdateCidaasGroup: EVENT:", event);
    return event;
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}

async function UpdateCidaasGroup(event, config){
    let responseObject = {
        updatedCidaasGroup: false,
        data: null,
        error: null
    }
    try {
        if(event.eventtype == "GROUP_DELETED" || event.eventtype == "GROUP_UPDATED"){
            console.log("No Cidaas Update required.");
            responseObject.data = "No Cidaas Update required";
            return responseObject;
        }
        if(!event.data || !event.data.freshdeskResponse){
            throw new Error("No freshdesk data available");
        }
        if(!event.data.groupInfoResponse || !event.data.groupInfoResponse.data){
            throw new Error("No Group data available!!")
        }
        let freshdeskResponse = event.data.freshdeskResponse;
        let groupInfo = event.data.groupInfoResponse.data;
        let companyId = freshdeskResponse.data.id;
        let fieldName = config.cidaasGroupCustomFieldForCompanyId;
        if(!groupInfo.customFields){
            groupInfo.customFields = {}
        }
        groupInfo.customFields[fieldName] = String(companyId);
        let response;
        if(freshdeskResponse.createdCompany){
            response = await updateCustomGroupInfo(groupInfo, config, event);
            responseObject.updatedCidaasGroup = true;
            responseObject.data = response.data;
        } else {
            console.log("No Cidaas Update required.");
            responseObject.data = "No Cidaas Update required";
        }

    } catch(error){
        console.log("DESTINATION:UpdateCidaas Group ERROR: ", error.message);
        responseObject.error = error;
    }

    return responseObject;

}

async function updateCustomGroupInfo(groupInfo, config, event){
    try {
        let response = await axios.put(config.base_url + '/groups-srv/usergroup',
            groupInfo, {
                headers: {
                    'Authorization': 'Bearer ' + event.data.access_token,
                    'Content-Type': 'application/json'
                }
            });
        if (!response || !response.data || response.status !== 200) {
            console.log('error updating cidaas group. response status', response.status, " response data: ", response.data);
            throw new Error("error updating cidaas group. Non success response status" + response);
        }
        return response;
    } catch(error){
        console.log("error calling groups-srv.", error.message);
        console.log('Update Cidaas Group: Error Trace: ', error);
        throw error;
    }
}