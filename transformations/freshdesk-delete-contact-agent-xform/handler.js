const axios = require("axios");
module.exports = async function (event, ctx, config) {
    console.log('Config@DeleteContactorAgentTransformaton: ', config);
    let freshdeskResponse = await deleteContactorAgent(event, config);
    //console.log("freshdeskResponse: ", freshdeskResponse);
    event.data.freshdeskResponse = freshdeskResponse;
    console.log("TRANSFORMATION:DELETECONTACTORAGENT: EVENT:", event);
    return event;
}

async function deleteContactorAgent(event, config){
    let responseObject = {
        deleteContact: false,
        deleteAgent: false,
        data: null,
        error: null
    };
    try {
        let freshdeskid = event.data.userInfo.userAccount.customFields.freshdeskid;
        if(!freshdeskid){
            throw new Error('field freshdeskid is required');
        }
        //console.log("event metadata: ", event.metadata);
        let email;
        let freshdeskId;
        if( event && event.metadata && event.metadata.email){
            email = event.metadata.email;
        }
        if(event && event.metadata && event.metadata.customFields && event.metadata.customFields.freshdeskid && event.metadata.customFields.freshdeskid.value){
            freshdeskId = event.metadata.customFields.freshdeskid.value;
        }
        if(!email || !freshdeskId){
            throw new Error('No email or freshdeskid exist in the event');
        }
        let fdGroup = getFreshdeskGroup(event, config);
        if(!fdGroup){
            throw new Error("No Freshdesk Group found in the user");
        }
        let response;
        if(fdGroup.roles && fdGroup.roles.includes("CONTACT")){
            let contact = await getContactorAgentByEmail( config,true,event.metadata.email);
            if(contact && contact.data){
                response = await deleteFreshdeskContactorAgent(event.metadata.customFields.freshdeskid.value, true, config);
                responseObject.data = response.data;
                responseObject.deleteContact = true;
            } else {
                console.log('No Action!! Reason: contact does not exist for ', email);
            }
        } else {
            let agent = await getContactorAgentByEmail(event.metadata.email, false);
            if(agent && agent.data){
                response = await deleteFreshdeskContactorAgent(event.metadata.customFields.freshdeskid.value, false, config);
                responseObject.data = response.data;
                responseObject.deleteAgent = true;
            } else {
                console.log('No Action!! Reason: Agent does not exist for ', email);
            }

        }
    }catch(error){
        console.log('error deleting freshdesk resource', error.message);
        responseObject.error = error;
    }
    return responseObject;

}

async function getContactorAgentByEmail(config, isContact, email){
    let url = config.freshdesk_url + '/api/v2/contacts?email=' + encodeURIComponent(email);
    if(!isContact){
        url = config.freshdesk_url + '/api/v2/agents?email=' + encodeURIComponent(email);
    }
    // console.log("URL: ", url);
    let response;
    try {
        response = await axios.get(url, {
            headers: {
                'Authorization': 'Basic ' + config.api_key
            },
            auth: {
                username: config.api_key,
                password: 'X' // 'X' as a placeholder for the password
            }
        });
        if (!response || !response.data || response.status !== 200) {
            console.log('error getting contact/agent with ID: ', email, response);
            return null;
        }
        return response;
    } catch(error){
        console.log('error getContactorAgentbyEmail', error.message);
        throw error;
    }

}

async function deleteFreshdeskContactorAgent(freshdeskid, isContact, config){
    let url = config.freshdesk_url + '/api/v2/contacts/' + freshdeskid;
    if(!isContact){
        url = config.freshdesk_url + '/api/v2/agents/' + freshdeskid;
    }
    //console.log('Delete URL', url);
    try {
        let response = await axios.delete(url,
            {
                auth: {
                    username: config.api_key,
                    password: 'X' // 'X' as a placeholder for the password
                }
            }
        );
        if (!response || !response.data || response.status !== 204) {
            console.log("DELETE RESPONSE: ", response);
            throw new Error('error deleting freshdesk resource');
        }
        return response;

    }catch(error){
        console.log('error deleteFreshdeskContactorAgent', error.message);
        throw error;
    }
}

function getFreshdeskGroup(event, config){
    let freshDeskGroupId = config.groupId;
    let freshDeskUserGroup;
    //console.log('Groups from UserInfo: ', event.data.userInfo.groups);
    //console.log('freshdeskGroupId from Config: ', config.groupId);
    for (let group of event.data.userInfo.groups) {
        console.log('GroupId from userInfo: ', group.groupId);
        if (group.groupId === freshDeskGroupId){
            freshDeskUserGroup = group;
        }
    }
    return freshDeskUserGroup;
}
