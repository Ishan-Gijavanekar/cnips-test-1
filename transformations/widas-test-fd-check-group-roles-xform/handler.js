const axios = require("axios");
module.exports = async function (event, ctx, config) {
    let data = await GetCidaasCompanyGroup(config, event);
    event.data.customGroupInfo = data;
    return event;
}

async function GetCidaasCompanyGroup(config, event){
    try{
        //let userCompanyGroups
        for (let group of event.data.userInfo.groups) {
            if (group.groupId === "CIDAAS_ADMINS")
                continue;
            let groupInfoResp = await GetCustomGroup(group.groupId, config, event);
            if(groupInfoResp && groupInfoResp.groupInfo){
                ///console.log('GINFO - Info - DATA: ', groupInfoResp.groupInfo);
                let groupInfo = groupInfoResp.groupInfo;
                //console.log('GINFO GID2 DATA: ', groupInfo.groupId);
                if(groupInfo.groupType && 
                    groupInfo.groupType === config.customerGroupType && group.roles
                    && config.contactRoles
                    ){
                        let arr = config.contactRoles.split(",");
                        if(arr.some(r => group.roles.indexOf(r) >= 0)){
                            
                            console.log("Config ARR2 Roles: ", config.contactRoles);
                            return [groupInfo];
                        }  
                }
                
            }
        }
        console.log("UserCompanyGroups: ", userCompanyGroups);
        return null;
    }catch(err){
        console.log("error finding GetCidaasCompanyGroup", err.message);
        throw new Error("error getting GetCidaasCompanyGroup");
    }
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
        const data = {groupInfo: groupInfoResp.data.data};
        //console.log("GroupInfo data: ", data);
        return data;

        }
    }catch(err){
        console.log("Get Custom GroupInfo err", err.message);
        throw new Error("error getting GroupInfo");
    }
}