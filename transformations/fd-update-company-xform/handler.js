const axios = require("axios");
module.exports = async function (event, ctx, config) {
    let freshdeskResponse = await updateCompany(event, config);
    event.data.freshdeskResponse = freshdeskResponse;
    //console.log("freshdesk Response: ", freshdeskResponse);
    console.log("TRANSFORMATION:UPDATECOMPANY: EVENT:", event);
    return event;
}

    

async function updateCompany(event, config){
    let responseObject = {
        updatedCompany: false,
        data: null,
        error: null
    }
    try {
        let groupInfo = event.data.groupInfoResponse.data;
        let companyId = Number(groupInfo.customFields[config.cidaasGroupCustomFieldForCompanyId]);
        //let companyId = groupInfo.customFields[config.cidaasGroupCustomFieldForCompanyId];
        if(!companyId){
            throw new Error(config.cidaasGroupCustomFieldForCompanyId + " does not exist");
        }
        let companyResponse = await getCompany(event, companyId, config);
        if(!companyResponse || !companyResponse.data){
            throw new Error( "Company does not exist " + companyId);
        }
        let companyUpdateObject = {
        }

        if (companyResponse.data.name !== groupInfo.groupName) {
            companyUpdateObject['name'] = groupInfo.groupName;
        }
        if(!companyUpdateObject || !companyUpdateObject.name){
            responseObject.updatedCompany = false;
            console.log("No update required. Company name not changed");
            return responseObject;
        }
        console.log("Update COmpany : ", companyUpdateObject);
        let response = await axios.put(config.freshdesk_url +`/api/v2/companies/`+companyId,
            companyUpdateObject,
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
            console.log('error updating company. response status', response.status, " response data: ", response.data);
            responseObject.error = response;
            return responseObject;
        }
        responseObject.data = response.data;
        responseObject.updatedCompany = true;
        return responseObject;
    } catch (error){
        responseObject.error = error;
        console.log("TRANSFORMATION:UPDATECOMPANY FUNCTION:UpdateCompany ERROR: ", error.message);
        //console.log("Error updating Company: ", error);
        return responseObject;
    }
}

async function updateCompany1(event, config){
    let responseObject = {
        updatedCompany: false,
        data: null,
        error: null
    }
    try {
        //let groupInfo = event.data.groupInfoResponse.data;
        console.log('GroupInfo: ', groupInfo);
        /*if(groupInfo && groupInfo.customFields){
            console.log('CustomFields: ', groupInfo.customFields);
            console.log('Freshdesk field from Config: ', config.cidaasGroupCustomFieldForCompanyId);
            let companyId = groupInfo.customFields[config.cidaasGroupCustomFieldForCompanyId];
            console.log('String companyId:', companyId);
            console.log("Parsing Number from CompanyID: ", Number(companyId));
        }*/
        //console.log('CompanyID: ', groupInfo.customFields[config.cidaasGroupCustomFieldForCompanyId]);
        let groupInfo = event.data.groupInfoResponse.data;
        let groupId = groupInfo.groupId;
        let companyId = groupInfo.customFields[config.cidaasGroupCustomFieldForCompanyId];
        if(!companyId){
            throw new Error(config.cidaasGroupCustomFieldForCompanyId + " does not exist");
        }
        let companyResponse = await getCompany(event, companyId, config);
        if(!companyResponse || !companyResponse.data){
            throw new Error( "Company does not exist " + companyId);
        }
        let companyUpdateObject = {
        }

        if (companyResponse.data.name !== groupInfo.groupName) {
            companyUpdateObject['name'] = groupInfo.groupName;
        }
        if(!companyUpdateObject){
            responseObject.updatedCompany = false;
            console.log("No update required. Company name not changed");
            return responseObject;
        }
        let response = await axios.put(config.freshdesk_url +`/api/v2/companies/`+companyId,
            companyUpdateObject,
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
            console.log('error updating company. response status', response.status, " response data: ", response.data);
            responseObject.error = response
            return responseObject;
        }
        responseObject.data = response.data;
        responseObject.updatedCompany = true;
        return responseObject;
    } catch (error){
        responseObject.error = error;
        console.log("TRANSFORMATION:UPDATECOMPANY FUNCTION:UpdateCompany ERROR: ", error.message);
        return responseObject;
    }
}

async function getCompany(event, companyId,config){
    try {
        console.log('CompanyID GetCompany: ', companyId);
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
        console.log("TRANSFORMATION:UPDATECOMPANY FUNCTION:getCompany ERROR: ", error.message);
        throw error;
    }
}