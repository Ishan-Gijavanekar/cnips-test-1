const axios = require("axios");

module.exports = async function (event, ctx, config) {
    let createContact = await checkContactOrCustomGroupExist(event,config)
    console.log("create Contact: ", createContact);
    return createContact;
}

async function checkContactOrCustomGroupExist(event, config){
    let customerGroupType = config.customerGroupType;
    let contactRoles = config.contactRoles.split(',');
    let userCompanyGroups = [];
    let freshDeskGroupId = config.groupId;
    let freshDeskUserGroup;
    for (let group of event.data.userData.groups) {
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
    //console.log("UserCompanyGroups: ", userCompanyGroups);
    //console.log("freshDeskUserGroup: ", freshDeskUserGroup);
    if((freshDeskUserGroup && freshDeskUserGroup.roles && freshDeskUserGroup.roles.includes("CONTACT"))
        || userCompanyGroups.length > 0){
        return true;
    }
    return false;
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
        //console.log("Error: ", err);
        console.log('Error access_token: ', event.data.access_token);
        throw new Error("error getting GroupInfo" + err);
    }
}