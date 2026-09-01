const axios = require('axios');
module.exports = async function (event, ctx, config) {
   //  let userInfo = event.data.userInfo;
    let agentResponse = await createAgent(event.data.userData,config)
    // console.log("agentCreated set to: ", agentResponse);
    event.data.agentResponse = agentResponse;
    console.log("TRANSFORMATION:FD_CREATE_AGENT_XFORM, EVENT:", event);
    return event;
}

async function createAgent(userInfo, config){
    let responseObject = {
        createAgent: false,
        data: null,
        error: null
    };
    try{

            let agentGroup;
            let freshdeskRoles = [];
            let freshdeskGroups = [];
            //console.log("UserInfo Groups; ", userInfo.groups);
            if(config.groupId && userInfo.groups){
                for (let group of userInfo.groups) {
                    if (group.groupId === config.groupId){
                        agentGroup = group;
                        break;
                    }
                }
                //console.log("Agent Group: ", agentGroup);
                for (let fdRole of Object.keys(FreshdeskRoles)){
                    if (agentGroup.roles.includes(fdRole) && FreshdeskRoles[fdRole] !== -1) {
                        freshdeskRoles.push(FreshdeskRoles[fdRole]);
                    }
                }

                for (let freshdeskGroup of Object.keys(FreshdeskGroups)) {
                    if (agentGroup.roles.includes(freshdeskGroup)) {
                        freshdeskGroups.push(FreshdeskGroups[freshdeskGroup]);
                    }
                }
                //console.log("Freshdesk Roles: ", freshdeskRoles)
                //console.log("Freshdesk G: ", freshdeskGroups)
                //console.log("Email ID: ", userInfo.identity.email);
                const body = {
                    name: userInfo.identity.given_name + ' ' + userInfo.identity.family_name,
                    email: userInfo.identity.email,
                    role_ids: freshdeskRoles,
                    //group_ids: freshdeskGroups,
                    ticket_scope: 1
                }
                //console.log("Body:", body)
                const response = await axios.post(config.freshdesk_url +`/api/v2/agents`,
                    body,
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
                    console.log('error creating agent. response status', response.status, " response data: ", response.data);
                    return responseObject;
                }
                responseObject.createAgent = true;
                responseObject.data = response.data;
                return responseObject;
            } else {
            throw new Error("No groups info found");
        }
    } catch(err){
        console.log('error creating freshdesk agent', err.message);
        responseObject.error = err;
        return responseObject;
    }
}

 const FreshdeskRoles = {
    ACCOUNT_ADMINISTRATOR : 19000042253,
    ADMINISTRATOR : 19000042254,
    SUPERVISOR : 203000043923,
    AGENT : 203000043924,
    CONTACT : -1
}

const FreshdeskGroups ={
        PRODUCT_MANAGEMENT : 19000152256,
        QA : 19000152255,
        SALES : 19000152257,
        CIDAAS_SUPPORT : 19000152190,
        POSTBANK_SUPPORT : 19000150215,
        TECH_SUPPORT_BHW : 19000150206,
        WIDAS_CONCEPTS_SUPPORT : 19000034649,
        CARBOOKPLUS_SUPPORT : 19000152309
}