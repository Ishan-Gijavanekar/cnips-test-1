const axios = require("axios");
module.exports = async function (event, ctx, config) {
    let freshdeskResponse = await deleteCompany(event, config);
    event.data.freshdeskResponse = freshdeskResponse;
    //console.log("freshdesk Response: ", freshdeskResponse);
    console.log("TRANSFORMATION:DELETECOMPANY: EVENT:", event);
    return event;
}

async function getCompany(event, companyId,config){
    try {
        let response = await axios.get(config.freshdesk_url +`/api/v2/companies/`+companyId, {
            auth: {
                username: config.api_key,
                password: 'X' // 'X' as a placeholder for the password
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response || !response.data || response.status !== 200) {
            console.log('error get company. response status', response.status, " response data: ", response.data);
            throw new Error("error get company. Non success response status" + response);
        }
        return response;
    } catch (error){
        console.log("TRANSFORMATION:DELETECOMPANY FUNCTION:getCompany ERROR: ", error.message);
        throw error;
    }
}

async function deleteCompany(event, config){
    let responseObject = {
        deletedCompany: false,
        error: null
    }

    try {
        let groupInfo = event.data.groupInfoResponse.data;
        let groupId = groupInfo.groupId;
        let companyId = Number(groupInfo.customFields[config.cidaasGroupCustomFieldForCompanyId]);
        if(!companyId){
            throw new Error(config.cidaasGroupCustomFieldForCompanyId + " does not exist");
        }
        let companyResponse = await getCompany(event, companyId, config);
        if(!companyResponse || !companyResponse.data){
            throw new Error( "Company does not exist " + companyId);
        }
        let response = await axios.delete(config.freshdesk_url +`/api/v2/companies/`+companyId,
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

        if (!response  || response.status !== 204) {
            console.log('error deleting company. response status', response.status, " response data: ", response.data);
            responseObject.error = response
            return responseObject;
        }
        responseObject.deletedCompany = true;
        return responseObject;
    } catch(error){
        responseObject.error = error;
        console.log("TRANSFORMATION:DELETECOMPANY FUNCTION:deleteCompany ERROR: ", error.message);
        return responseObject;
    }
}
