const axios = require("axios");

module.exports = async function (event, ctx, config) {
    let officeTokenResponse = await updateOfficeUser(event);
    event.data.officeTokenResppnse = officeTokenResponse;
    console.log("TRANSFORMATION:OFFICE_UPDATE_USER, EVENT: ", event);
    return event;
}

async function updateOfficeUser(event){
    let responseObject = {
        updatedOfficeUser:false,
        data: null,
        error: null
    };
    try{
        if(!event.data || !event.data.userInfo || !event.data.userInfo.userAccount 
            || !isCidaasUserVerified(event.data.userInfo.userAccount)){
            console.log("user connot be provisioned. User is not Verified");
        }
        /*if(!event.data || !event.data.officeTokenResponse || !event.data.officeTokenResponse.data || !!event.data.officeTokenResponse.data.access_token){
            console.log("user cannot be provisioned. Reason: Office access_token  not found in the event.");
            responseObject.data = "user cannot be provisioned. Reason: Office access_token  not found in the event.";
            return responseObject;
        }
        if(!event.data.userInfo || !event.data.userInfo.userAccount
            || !event.data.userInfo.userAccount.customFields
            || !event.data.userInfo.userAccount.customFields.immutableid){
            console.log("user cannot be provisioned. Reason: immutableid  not found for the user.");
            responseObject.data = "user cannot be provisioned. Reason: immutableid  not found for the Cidaas user.";
            return responseObject;
        }
        let immutableId = event.data.userInfo.userAccount.customFields.immutableid;
        let access_token = event.data.officeTokenResponse.data.access_token;
        let userPrincipalResponse = await getUserPrincipalNamebyImmutableId(immutableId, access_token);
        if(!userPrincipalResponse  || !userPrincipalResponse.success){
            console.log('User cannot be provisioned. User Principal could not be found for immutableId:', immutableId);
            return responseObject;
        }*/
        if(!event.data || !event.data.officeTokenResponse || !event.data.officeTokenResponse.data || !!event.data.officeTokenResponse.data.access_token){
            console.log("user cannot be provisioned. Reason: Office access_token  not found in the event.");
            responseObject.data = "user cannot be provisioned. Reason: Office access_token  not found in the event.";
            return responseObject;
        }
        if( !event.data.UserPrincipalResponse || !event.data.UserPrincipalResponse.gotUserPrincipal){
            console.log("User cannot be provisioned. No user principal found in the event.");
            return responseObject;
        }
        let userPrincipalResponse = event.data.UserPrincipalResponse;
        let access_token = event.data.officeTokenResponse.data.access_token;
        if(userPrincipalResponse.data && userPrincipalResponse.data){
            let updateObject = getUpdateObject(event.data.userInfo.userAccount, userPrincipalResponse.data, event.data.userInfo.identity);
            if( !updateObject || Object.keys(updateObject).length === 0){
                console.log("No update is required. Reason: No change in Office data");
                return  responseObject;
            }
            let response = await axios.patch('https://graph.microsoft.com/v1.0/users/' + userPrincipalResponse.userPrincipalName,
                updateObject, {
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                        'Content-type': 'application/json',
                        'Host': 'graph.microsoft.com'
                    }
                });
            if(!response || response.status != 200){
                console.log('Non success status updating user in Office. Resoonse: ', response);
                responseObject.data = response;
            }
        } else {
            console.log('User cannot be provisioned. Reason: No UserPrincipal data could be found.');
            return responseObject;
        }
        responseObject.updatedOfficeUser = true;
    } catch(err){
        console.log("error updating user. error: ", err.message);
        responseObject.error = err;
    }
    return responseObject;
}

function getUpdateObject(userAccount, userPrincipal, identity){
    let userStatus = userAccount.userStatus === 'VERIFIED';
    let updateObject = {};
    if (userPrincipal.accountEnabled !== userStatus) {
        updateObject.accountEnabled = userStatus;
    }
    if (!!identity.given_name && userPrincipal.givenName !== identity.given_name) {
        updateObject.givenName = identity.given_name;
    }

    if (!!identity.family_name && userPrincipal.surname !== identity.family_name) {
        updateObject.surname = identity.family_name;
    }

    let displayName = identity.given_name + ' ' + identity.family_name;
    if (!!displayName && userPrincipal.displayName !== displayName) {
        updateObject.displayName = displayName;
    }
    if (identity.email && userPrincipal.mail !== identity.email) {
        updateObject.mail = identity.email;
    }
    let mailNickname = identity.email.substring(0, identity.email.indexOf('@'));
    if (!!mailNickname && userPrincipal.mailNickname !== mailNickname) {
        updateObject.mailNickname = mailNickname;
    }

    if (!!identity.mobile_number && userPrincipal.mobilePhone !== identity.mobile_number) {
        if (identity.mobile_number.trim() === '' && userPrincipal.mobilePhone !== null) {
            updateObject.mobilePhone = null;
        } else if (identity.mobile_number.trim() !== '') {
            updateObject.mobilePhone = identity.mobile_number;
        }
    }

    if (!!identity.email && userPrincipal.userPrincipalName !== identity.email) {
        updateObject.userPrincipalName = identity.email;
    }

    let fields = userAccount.customFields;
    if (isCidaasUserCustomFieldValid(fields.jobTitle)
        && userPrincipal.jobTitle !== fields.jobTitle.value) {
        updateObject.jobTitle = fields.jobTitle.value;
    }
    if (isCidaasUserCustomFieldValid(fields.officeLocation)
        && userPrincipal.officeLocation !== fields.officeLocation.value) {
        updateObject.officeLocation = fields.officeLocation.value;
    }
}

function isCidaasUserCustomFieldValid(field) {
    if (!field) {
        return false
    }
    if (!field.value && field.value !== '') {
        return false;
    }
    return true;
}

function isCidaasUserVerified(account) {
    if (!account || !account.userStatus) {
        return false;
    }
    return account.userStatus === 'VERIFIED';
}