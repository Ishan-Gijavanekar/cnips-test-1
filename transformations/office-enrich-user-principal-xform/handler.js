module.exports = async function (event, ctx, config) {
    let userPrincipalResponse = await getUserPrincipalNamebyImmutableId(event, config);
    event.data.UserPrincipalResponse = userPrincipalResponse;
    console.log("TRANSFORMATION:ENRICH_USER_PRINCIPAL. EVENT: ", event);
}

async function getUserPrincipalNamebyImmutableId(event){
    //let listParams = '?$select=onPremisesImmutableId,userPrincipalName';
    let   listParams = '?$select=accountEnabled,assignedLicenses,businessPhones,displayName,givenName,id,jobTitle,mail,mailNickname,mobilePhone,officeLocation,onPremisesImmutableId,preferredLanguage,sub,surname,userPrincipalName';
    let requestURL = 'https://graph.microsoft.com/v1.0/users/' + listParams;
    let loop = true;
    let responseObject = {
        gotUserPrincipal: false,
        data: null,
        error: null
    }
    try {

        if(!event.data || !event.data.officeTokenResponse || !event.data.officeTokenResponse.data || !event.data.officeTokenResponse.data.access_token){
            console.log("user cannot be provisioned. Reason: Office access_token  not found in the event.");
            responseObject.data = "user cannot be provisioned. Reason: Office access_token  not found in the event.";
            return responseObject;
        }
        console.log("Incoming Event: ", event.data.userInfo);
        if(!event.data.userInfo || !event.data.userInfo.userAccount
            || !event.data.userInfo.userAccount.customFields
            || !event.data.userInfo.userAccount.customFields.immutableid){
            console.log("user cannot be provisioned. Reason: immutableid  not found for the user.");
            responseObject.data = "user cannot be provisioned. Reason: immutableid  not found for the Cidaas user.";
            return responseObject;
        }
        let immutableId = event.data.userInfo.userAccount.customFields.immutableid;
        let access_token = event.data.officeTokenResponse.data.access_token;
        while(loop){
            let response =  await axios.get(requestURL, {
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-type': 'application/json',
                    'Host': 'graph.microsoft.com'
                }
            });
            if (!response || !response.status || response.status !== 200 || !response.data || !response.data.value) {
                loop = false;
                console.log('Non success response getting Office UserPrincipal name by immutableId. Response: ', response);
                responseObject.data = response;
                return responseObject;
            }
            let list = response.data.value;
            //console.log('List: ', list);
            for (let user of list) {
                if (user.onPremisesImmutableId !== null && user.onPremisesImmutableId === immutableId) {
                    loop = false;
                    responseObject.gotUserPrincipal = true;
                    responseObject.data = response.data;
                    console.log('found user principal. Response: ', response);
                    return responseObject;
                }
            }
            requestURL = response.data['@odata.nextLink'];
            if (!requestURL) {
                loop = false;
            }

        }
    } catch (error){
        console.log('error getting UserPrincipalName by immutableId.', error);
        responseObject.error = error;
        return responseObject;
    }
    return responseObject;

}