module.exports = function (event, ctx, config) {
    let validGroup = validateGroupInfo(event, config);
    console.log("DECISION:ValidateGroupInfo: validGroup:", validGroup);
    return validGroup;
}

function validateGroupInfo(event, config){
    //console.log('event.data: ', event.data);
    console.log('event.data.groupInfoResponse: ', event.data.groupInfoResponse);
    let groupInfoResponse = event.data.groupInfoResponse;
    if(!groupInfoResponse || !groupInfoResponse.data ||
    !groupInfoResponse.data.groupId || !groupInfoResponse.data.groupName){
        console.log("missing groupInfo - groupname/groupId missing!!");
        return false;
    }
    let customerGroupType = config.customerGroupType;
    if(!groupInfoResponse.data.groupType ||
     customerGroupType !== groupInfoResponse.data.groupType){
        console.log("Group will not be provisioned Reason: invalid group type ", groupInfoResponse.data.groupType);
        return false;
    }
    return true;

}