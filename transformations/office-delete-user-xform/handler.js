module.exports = function (event, ctx, config) {
    let deleteOfficeUserResponse = await deleteUser(event);
    event.data.deleteOfficeUserResponse = deleteOfficeUserResponse;
    console.log("TRANSFORMATION:DELETE_USER_OFFICE. EVENT: ", event);
}

async function deleteUser(event){
    let responseObject = {
        deletedUser: false,
        data: null,
        error: null
    }
    try {
        if(!event.data || !event.data.officeTokenResponse || !event.data.officeTokenResponse.data || !!event.data.officeTokenResponse.data.access_token){
            console.log("user cannot be provisioned. Reason: Office access_token  not found in the event.");
            responseObject.data = "user cannot be provisioned. Reason: Office access_token  not found in the event.";
            return responseObject;
        }
        let access_token = event.data.officeTokenResponse.data.access_token;
        let userPrincipalResponse = event.data.UserPrincipalResponse;
        let response = null;
        if (!event.metaData.email) {
            if (!event.metaData.customFields
                || !event.metaData.customFields.immutableid
                || !event.metaData.customFields.immutableid.value) {
                console.log('user cannot be deleted. Reason: immutableid/email not present in the event');
                return responseObject;
            }
            if( !event.data.UserPrincipalResponse || !event.data.UserPrincipalResponse.gotUserPrincipal){
                console.log("User cannot be provisioned. No user principal found in the event.");
                return responseObject;
            }
            response = await axios.delete('https://graph.microsoft.com/v1.0/users/' + userPrincipalResponse.data, {
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-type': 'application/json',
                    'Host': 'graph.microsoft.com'
                }
            });
        } else {
            console.log('No immutableid found in the event. Will be deleted by email.')
            response = await axios.delete('https://graph.microsoft.com/v1.0/users/' + event.metadata.email, {
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-type': 'application/json',
                    'Host': 'graph.microsoft.com'
                }
            });
        }
        /*if( event && event.metadata ){
            if(event.metadata.customFields && event.metadata.customFields.immutableid &&  event.metadata.customFields.immutableid.value){
                if( !event.data.UserPrincipalResponse || !event.data.UserPrincipalResponse.gotUserPrincipal){
                    console.log("User cannot be provisioned. No user principal found in the event.");
                    return responseObject;
                }
                 response = await axios.delete('https://graph.microsoft.com/v1.0/users/' + userPrincipalResponse.data, {
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                        'Content-type': 'application/json',
                        'Host': 'graph.microsoft.com'
                    }
                });
            } else if(event.metadata.email){
                //delete by email
                response = await axios.delete('https://graph.microsoft.com/v1.0/users/' + event.metadata.email, {
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                        'Content-type': 'application/json',
                        'Host': 'graph.microsoft.com'
                    }
                })

            }
        } else {
            console.log("user cannot be deleted. Reason: immutableid/email not present in the event");
            return responseObject;
        }*/



        //let immutableId = event.data.userInfo.userAccount.customFields.immutableid;

        if(!response || response.status != 204){
            console.log('Non success status deleting user in Office. Response: ', response);
            responseObject.data = response;
        }
        responseObject.deletedUser = true;
    } catch (error){
        console.log("error deleting user. error: ", error.message);
        responseObject.error = error;
    }
    return responseObject;
}