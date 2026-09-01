module.exports = function (event, ctx, config) {
    if(event && event.data && event.data.userInfo && event.data.userInfo.groups && config.groupId){
        let officeGrp = getOfficeGroup(config.groupId, event.data.userInfo.groups);
        if(officeGrp && officeGrp.groupId){
            return true;
        }
    }
    console.log('No Office group found and user will not be provisioned.')
    return false;
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