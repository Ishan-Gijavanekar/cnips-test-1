module.exports = function (event, ctx, config) {
    let groupLeftResponse = needUpdateForGroupLeftEvent(event);
    console.log("needUpdateForGroupLeftEvent Response: ", groupLeftResponse);
    console.log("DECISION:needUpdateForGroupLeftEvent, EVENT: ", event);
    return groupLeftResponse;
}

function needUpdateForGroupLeftEvent(event){
    if(event.eventtype == 'GROUP_USER_REMOVED'){
        const userAccount = event.data.userInfo.userAccount;
        if(!userAccount || !userAccount.customFields || !userAccount.customFields.customFields.onPremisesImmutableId
            || !userAccount.customFields.customFields.onPremisesImmutableId.value ||
            userAccount.customFields.customFields.onPremisesImmutableId.value == ''){
            console.log('User cannot be provisioned. immutableid does not present.');
            return false;
        }
        if(!event.data.officeResponse || !event.data.officeResponse.data){
            console.log('User cannot be provisioned. Office data does not present.');
            return false;
        }
        const officeData = event.data.officeResponse.data;
        if(!officeData.accountEnabled){
            console.log('No Action needed. Account is not enabled in Office.');
            return false;
        }
        return true;
    }
    return false;
}