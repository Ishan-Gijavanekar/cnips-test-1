const axios = require('axios');
module.exports = async function (event, ctx, config) {
    let userData = event.data.userData;
    //console.log("UserData: ", userData);
    //console.log('userData.identity:', userData.identity);
    let contactResponse = await updateContact(event.data.userData,config)
    console.log("contactCreated set to: ", contactResponse);
    event.data.contactResponse = contactResponse;
    console.log('TRANSFORMATION:FD_CREATE_CONTACT_XFORM', "Event: ", event);
    return event;
}

async function updateContact(userInfo, config){
    let responseObject = {
        createContact: false,
        data: null,
        error: null
    };
    try{
        if (config && config.company_id){
            let response = await axios.put(config.freshdesk_url +`/api/v2/contacts`,
                {
                    name: userInfo.identity.given_name + ' ' + userInfo.identity.family_name,
                    email: userInfo.identity.email,
                    company_id: Number(config.company_id)
                },
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
            if (!response || !response.data) {
                console.log('error updating contact. response status', response.status, " response data: ", response.data);
                return responseObject;
            }
            responseObject.createContact = true;
            responseObject.data = response.data;
            return responseObject;

        } else {
            throw new Error("company ID is required");
        }
    } catch(err){
        console.log('error updating contact: ', err.message);
        responseObject.error = err;
        return responseObject;
    }
}
