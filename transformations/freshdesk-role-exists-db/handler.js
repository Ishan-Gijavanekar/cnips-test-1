const axios = require("axios");
module.exports = async function (event, ctx, config) {
    let rolesExist = await checkGroupAndRolesExist(event, config);
    console.log("DECISION:freshdesk_roles_exist: rolesExist:", rolesExist);
    return rolesExist;
    
}

async function checkGroupAndRolesExist(event, config){
    let customerGroupType = config.customerGroupType;
    let contactRoles = config.contactRoles.split(',');
    let userCompanyGroups = [];
    let freshDeskGroupId = config.groupId;
    let freshDeskUserGroup;
    if(!event.data.userInfo.groups || event.data.userInfo.groups.length < 1){
        //console.log('Groups does not exist for user ', userInfo.identity.sub);
        console.log("DECISON_BLOCK:ROLES_EXIST. MESSAGE:No action required. Reason: Groups does not exist for user  ", event.data.userInfo.identity.sub);
        return false;
    }
    for (let group of event.data.userInfo.groups) {
        if (group.groupId === "CIDAAS_ADMINS")
            continue;
        let groupInfo = await GetCustomGroup(group.groupId,config, event);
        //console.log("GroupInfo: ", groupInfo)
        if (groupInfo
            && groupInfo.groupType
            && groupInfo.groupType === customerGroupType
            && group.roles
            && contactRoles.some(r => group.roles.indexOf(r) >= 0)) {
            userCompanyGroups.push(groupInfo.data);
        }
        if (group.groupId === freshDeskGroupId){
            freshDeskUserGroup = group;
        }

    }
    if (!freshDeskUserGroup && userCompanyGroups.length <= 0) {
        console.log("DECISON_BLOCK:ROLES_EXIST. MESSAGE:No action required. Reason: required group ", config.groupId,  " or user company group type ", config.customerGroupType , " does not exist");
        return false;
    }
    return true;
}

async function GetCustomGroup(groupId, config, event){
    try {
        if(groupId){

            let URL = config.base_url + '/groups-srv/usergroup/'+groupId;
            let groupInfoResp = await axios.get(URL, {
                headers: {
                    "Authorization": `Bearer ${event.data.access_token}`
                }
            });
            // console.log("GroupInfo GroupID: ", groupInfoResp.data.data.groupId)
            //const data = {groupInfo: groupInfoResp.data};
            const data = groupInfoResp.data.data;
            // console.log("GroupInfo data: ", data);
            return data;

        }
    }catch(err){
        console.log("Get Custom GroupInfo err", err.message);
        throw new Error("error getting GroupInfo");
    }
}