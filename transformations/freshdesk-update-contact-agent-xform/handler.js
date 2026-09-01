const axios = require("axios");
module.exports = async function (event, ctx, config) {
    let freshdeskResponse = await updateContactorAgent(event, config);
    //console.log("Incoming Config Data - UPDATECONTACTORAGENT: ", config);
    event.data.freshdeskResponse = freshdeskResponse;
    console.log("TRANSFORMATION:UPDATECONTACTORAGENT: EVENT:", event);
    return event;
}

async function updateContactorAgent(event, config){
    let responseObject = {
        updateContact: false,
        updateAgent: false,
        data: null,
        error: null
    };
    try{
        if( !event.data.userInfo.userAccount.customFields ||
        !event.data.userInfo.userAccount.customFields.freshdeskid){
            console.log('freshdeskid does not present in the event');
            throw new Error('freshdeskid does not present in the event');
        }
        let freshdeskid = event.data.userInfo.userAccount.customFields.freshdeskid;
        if(!freshdeskid){
            throw new Error('field freshdeskid is required');
        }
        if (config && config.company_id){
            let fdGroup = getFreshdeskGroup(event, config);
            if(!fdGroup){
                throw new Error("No Freshdesk Group found in the user");
            }
            //console.log("FreshdeskGroup", fdGroup);
            let updateObject = {};
            let response;
            if(fdGroup.roles && fdGroup.roles.includes("CONTACT")){
                //Update Contact
                let getContactResponse = await getContact(freshdeskid, config);
                //console.log("getContactResponse; ", getContactResponse);

                if(getContactResponse && getContactResponse.data){
                    updateObject = getUpdateObject(getContactResponse.data, event.data.userInfo.identity, fdGroup, true, config);
                    if (updateObject.name || updateObject.email || updateObject.company_id){
                        //Update Freshdesk
                        response = await axios.put(config.freshdesk_url +`/api/v2/contacts/`+freshdeskid,
                            updateObject,
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
                        if (!response || !response.data || response.status !== 200) {
                            throw new Error('Error updating contact');
                        }
                    } else {
                        console.log('No change in contact data. No freshdesk update is needed');
                        return responseObject;
                    }
                    responseObject.updateContact = true;
                    responseObject.data = response.data;

                } else {
                    throw Error('contact does not exist for id: '+ freshdeskid);
                }
            } else {
                //Update Agent
                let getAgentResponse = await getAgent(freshdeskid, config);
                console.log("getAgentResponse; ", getAgentResponse);
                if(getAgentResponse && getAgentResponse.data){
                    updateObject = getUpdateObject(getAgentResponse.data, event.data.userInfo.identity, fdGroup, false, config);
                    console.log("update: ", updateObject);
                    if( updateObject.role_ids || updateObject.group_ids ||
                        (updateObject.contact &&
                            (updateObject.contact.email|| updateObject.contact.name)
                        )
                    ){
                        //Update Agent:
                        response = await axios.put(config.freshdesk_url +`/api/v2/agents/`+freshdeskid,
                            updateObject,
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

                        if (!response || !response.data || response.status !== 200) {
                            throw new Error('Error updating agent');
                        }
                        responseObject.updateAgent = true;
                        responseObject.data = response.data;

                    } else {
                        //console.log("Agent Data not changed. No action needed!!")
                        console.log('No change in Agent data. No freshdesk update is needed');
                        return responseObject;
                    }



                } else {
                    throw new Error('agent does not exist for id: '+ freshdeskid);
                }
            }
            return responseObject;
        } else {
            throw new Error("company ID is required");
        }
    } catch (err){
        responseObject.error = err;
        console.log("TRANSFORMATION:UPDATECONTACTORAGENT ERROR: ", err.message);
        return responseObject;
    }

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

function getUpdateObject(freshDeskData, identity, fdGroup, isContact, config){
    let updateObject = {};
    let cidaasName = identity.given_name + ' ' + identity.family_name;


    if (isContact){
        if ( cidaasName !=  freshDeskData.name){
            updateObject.name = cidaasName;
        }
        if(identity.email != freshDeskData.email){
            updateObject.email = identity.email;
        }
        if(config.company_id && freshDeskData.company_id 
         && Number(config.company_id) != Number(freshDeskData.company_id)){
            updateObject.company_id = Number(config.company_id);
        }
        //TODO: 'other_companies'
    } else {
        let freshdeskRoles = [];
        let freshdeskGroups = [];
        for (let fdRole of Object.keys(FreshdeskRoles)){
            if (fdGroup.roles.includes(fdRole) && FreshdeskRoles[fdRole] !== -1) {
                freshdeskRoles.push(FreshdeskRoles[fdRole]);
            }
        }
        for (let freshdeskGroup of Object.keys(FreshdeskGroups)) {
            if (fdGroup.roles.includes(freshdeskGroup)) {
                freshdeskGroups.push(FreshdeskGroups[freshdeskGroup]);
            }
        }
        if (freshDeskData.role_ids !== freshdeskRoles) {
            updateObject['role_ids'] = freshdeskRoles
        }

        console.log("FreshDESK CONTACT ", freshDeskData.contact);
        if (freshDeskData.contact ) {

            if(freshDeskData.contact.name !== cidaasName){
                updateObject['name'] = cidaasName;
            }
            if(freshDeskData.contact.email !== identity.email){
                updateObject['email'] = identity.email;
            }

            updateObject['role_ids'] = freshdeskRoles
        }
        if (freshDeskData.group_ids !== freshdeskGroups) {
            updateObject['group_ids'] = freshdeskGroups
        }
    }
    //console.log("updateObject with:", updateObject);
    return updateObject;

}


async function getContact(freshdeskId, config){
    try {
        let response = await axios.get(config.freshdesk_url +`/api/v2/contacts/` +freshdeskId, {
            headers: {
                'Authorization': 'Basic ' + config.api_key
            },
            auth: {
                username: config.api_key,
                password: 'X' // 'X' as a placeholder for the password
            }
        });
        if (!response || !response.data || response.status !== 200) {
            console.log('error getting contact with ID: ', freshdeskId, response);
            return null;
        }
        return response;
    } catch(error){
        console.log('error Get Contact: ', error.message);
        throw error;
    }

}

async function getAgent(freshdeskId, config){
    try {
        let URL = config.freshdesk_url +`/api/v2/agents/` +freshdeskId;
        console.log('Get URL: ', URL);
        let response = await axios.get(config.freshdesk_url +`/api/v2/agents/` +freshdeskId, {
            headers: {
                'Authorization': 'Basic ' + config.api_key
            },
            auth: {
                username: config.api_key,
                password: 'X' // 'X' as a placeholder for the password
            }
        });
        if (!response || !response.data || response.status !== 200) {
            console.log('error getting agent with ID: ', freshdeskId, response);
            return null;
        }
        return response;
    } catch(error){
        console.log('error GetAgent: ', error.message);
        throw error;
    }
}