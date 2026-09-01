const axios = require("axios");
const Office365License = {
    EXCHANGE_ONLINE_KIOSK : '80b2d799-d2ba-4d2a-8842-fb0d0f3a4b82',
        OFFICE_365_E1 : '18181a46-0d4e-45cd-891e-60aabd171b4e',
        OFFICE_365_E3 : '6fd2c87f-b296-42f0-b197-1e91e994b900',
        OFFICE_365_E5 : 'c7df2760-2c81-4ef7-b578-5b5392b571df'
}

function getOfficeGroup(officeGroupId, groups){
    let officeGroup;
    for (let group of groups) {
        if (group.groupId === "CIDAAS_ADMINS")
            continue;
        if (group.groupId === officeGroupId){
            officeGroup = group;
        }
    }
    return officeGroup;
}

async function provisionLicense(event, config){
    let responseObject = {
        provisionedLicense: false,
        data: null,
        error: null
    }
    try {
        if( !event.data.UserPrincipalResponse || !event.data.UserPrincipalResponse.gotUserPrincipal){
            console.log("User licenses  cannot be provisioned. No user principal found in the event.");
            return responseObject;
        }
        let access_token = event.data.officeTokenResponse.data.access_token;
        let userPrincipal = event.data.UserPrincipalResponse.data;
        if(!userPrincipal.assignedLicenses){
            console.log("User licenses  cannot be provisioned. User does not have valid licenses.");
            return responseObject;
        }
        let officeGroup = getOfficeGroup(config.groupId, event.data.userInfo.groups);
        let licenseRequest = { addLicenses: [], removeLicenses: [] };
        for (let license of Object.keys(Office365License)) {
            let licenseIndex = getLicenseIndexFromO365User(userPrincipal, Office365License[license]);
            if (officeGroup.roles.includes(license) && licenseIndex === -1) {
                licenseRequest.addLicenses.push({ skuId: Office365License[license] });
            } else if (!officeGroup.roles.includes(license) && licenseIndex >= 0) {
                licenseRequest.removeLicenses.push(Office365License[license]);
            }
        }
        let response = await axios.post('https://graph.microsoft.com/v1.0/users/' + userPrincipal.userPrincipalName + '/assignLicense',
            licenseRequest, {
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-type': 'application/json',
                    'Host': 'graph.microsoft.com'
                }
            });
        if(!response || response.status != 200){
            console.log("non success response provisioning license for user with immutableId. ", userPrincipal.onPremisesImmutableId);
            responseObject.data = response;
            return responseObject;
        }
        responseObject.provisionedLicense = true;
        return responseObject;
    } catch(error){
        console.log("error provisioning licenses for user. error: ", error.message);
        responseObject.error = error;
        return responseObject;
    }
}

function getLicenseIndexFromO365User(user, license) {
    if (!user || !user.assignedLicenses || !Array.isArray(user.assignedLicenses) || !license) {
        throw new Error('getLicenseIndexFromO365User has been called with invalid parameters!');
    }
    for (let l of user.assignedLicenses) {
        if (!l.skuId) {
            throw new Error('getLicenseIndexFromO365User has been called with invalid parameters!');
        }
    }
    return user.assignedLicenses.findIndex((assignedLicense) => assignedLicense.skuId === license);
}

module.exports = async function (event, ctx, config) {
    let licenseResponse = await provisionLicense(event, config);
    event.data.licenseResponse = licenseResponse;
    console.log("TRANSFORMATION:PROVISION_LICENSE, EVENT: ", event);
    return event;
}