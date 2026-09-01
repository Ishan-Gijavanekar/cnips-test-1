const axios = require("axios");
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
module.exports = async function (event, ctx, config) {
    let freshdeskResponse = await createContactOrAgent(event, config);
    event.data.freshdeskResponse = freshdeskResponse;
    //console.log("freshdesk Response: ", freshdeskResponse);
    console.log("TRANSFORMATION:CREATECONTACTORAGENT: EVENT:", event);
    return event;
}

async function createContactOrAgent(event, config){
    let responseObject = {
        createContact: false,
        createAgent: false,
        data: null,
        error: null
    };

    try {
        if (config && config.company_id){
            let fdGroup = getFreshdeskGroup(event, config);
            if(!fdGroup){
                throw new Error("No Freshdesk Group found in the user");
            }
            let userInfo = event.data.userInfo;
            let body = {
                name: userInfo.identity.given_name + ' ' + userInfo.identity.family_name,
                email: userInfo.identity.email
            };
            let response;
            if(fdGroup.roles && fdGroup.roles.includes("CONTACT")){
                body.company_id = Number(config.company_id)
                //Create Contact:
                 response = await axios.post(config.freshdesk_url +`/api/v2/contacts`,
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
                 responseObject.createContact = true;

            } else {
                //Create Agent:

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
                body.group_ids = freshdeskGroups;
                body.role_ids = freshdeskRoles;
                body.ticket_scope = 1;

                response = await axios.post(config.freshdesk_url +`/api/v2/agents`,
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
                responseObject.createAgent = true;
            }
            if (!response || !response.data || response.status !== 201) {
                console.log('error creating contact/agent. response status', response.status, " response data: ", response.data);
                return responseObject;
            }
            responseObject.data = response.data;
            console.log("TRANSFORMATION:CREATECONTACTORAGENT MESSAGE: freshdesk resource has been provisioned.")
            return responseObject;
        } else {
            throw new Error("company ID is required");
        }
    } catch(err){
        responseObject.error = err;
        console.log("TRANSFORMATION:CREATECONTACTORAGENT ERROR: ", err.message);
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