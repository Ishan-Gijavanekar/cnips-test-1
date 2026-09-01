const axios = require("axios");
module.exports = async function (event, ctx, config) {
    let exists = await isResourceExists(event, config);
    //console.log('isUpdate', exists);
    console.log("DECISION:JOINEDGROUP-UPDATE-DECISION: exists:", exists);
    return exists;
}

function getFreshdeskGroup(event, config){
    let freshDeskGroupId = config.groupId;
    let freshDeskUserGroup;
    for (let group of event.data.userInfo.groups) {
        if (group.groupId === freshDeskGroupId){
            freshDeskUserGroup = group;
        }
    }
    return freshDeskUserGroup;
}

async function getContactorAgent(config, isContact, freshdeskid){
    let url = config.freshdesk_url + '/api/v2/contacts/'+freshdeskid;
    if(!isContact){
        url = config.freshdesk_url + '/api/v2/agents/'+freshdeskid;
    }
    //console.log("URL: ", url);
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
            console.log('error getting contact/agent with ID: ', freshdeskid, response);
            return null;
        }
        return response;
    } catch(error){
        console.log('error getContactorAgent', error.message);
        throw error;
    }
}

async function isResourceExists(event, config){
    try {
        if( !event.data.userInfo.userAccount.customFields ||
        !event.data.userInfo.userAccount.customFields.freshdeskid){
            console.log('freshdeskid does not present in the event');
            throw new Error('freshdeskid does not present in the event');
        }
        let freshdeskid = event.data.userInfo.userAccount.customFields.freshdeskid;
        let fdGroup = getFreshdeskGroup(event, config);
        if(fdGroup.roles && fdGroup.roles.includes("CONTACT")){
            let contact = await getContactorAgent( config,true,freshdeskid);
            if(contact && contact.data){
                return true;
            }
        } else {
            let agent = await getContactorAgent( config,true,freshdeskid);
            if(agent && agent.data){
                return true;
            }
        }
        return false;

    }catch (error){
        console.log('error isUpdate', error.message);
        throw error;
    }

}