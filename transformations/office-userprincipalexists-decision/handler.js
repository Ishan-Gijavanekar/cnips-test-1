const axios = require("axios");
module.exports = async function (event, ctx, config) {
    let userPrincipalResponse = await userPrincipalExists(event);
    console.log('userPrincipalResponse Exists: ', userPrincipalResponse);
    //event.data.UserPrincipalResponse = userPrincipalResponse;
    console.log("DECISION:USER_PRINCIPAL_EXISTS. EVENT: ", event);
    return userPrincipalResponse;
}

async function userPrincipalExists(event){
    
    try {
        if(!event.data || !event.data.officeTokenResponse || !event.data.officeTokenResponse.data || !event.data.officeTokenResponse.data.access_token){
            console.log("user cannot be provisioned. Reason: Office access_token  not found in the event.");
            //responseObject.data = "user cannot be provisioned. Reason: Office access_token  not found in the event.";
            return false;
        }
        //console.log("Incoming Event: ", event.data.userInfo);
        /*if(!event.data.userInfo || !event.data.userInfo.userAccount
            || !event.data.userInfo.identity
            || !event.data.userInfo.identity.email){
            console.log("user cannot be provisioned. Reason: identity/email  not found for the user.");
            //responseObject.data = "user cannot be provisioned. Reason: identity/email  not found for the user.";
            return responseObject;
        }*/
        let listParams = '?$select=accountEnabled,assignedLicenses,businessPhones,displayName,givenName,id,jobTitle,mail,mailNickname,mobilePhone,officeLocation,onPremisesImmutableId,preferredLanguage,sub,surname,userPrincipalName';
        let requestURL = 'https://graph.microsoft.com/v1.0/users/'+event.data.userInfo.identity.email + listParams;
        let response =  await axios.get(requestURL, {
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'Content-type': 'application/json',
                'Host': 'graph.microsoft.com'
            }
        });
        if (!response || !response.status || response.status !== 200 || !response.data || !response.data.value) {
            console.log('cannot get Office UserPrincipal name by email user needs to created in Office. Response: ', response);
            return false;
        } else {
            console.log("User Principal exists. User needs to be updated in Office. Response", response.data);
            return true;
        }
    } catch (error){
        console.log('error getting UserPrincipalName by email.', error);
        throw error;
        //return false;
    }
    

}