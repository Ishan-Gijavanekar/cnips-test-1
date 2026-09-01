const axios = require("axios");
module.exports = async function (event, ctx, config) {
    let groupInfoResponse = await validateandGetGroupInfo(event, config);
    event.data.groupInfoResponse = groupInfoResponse;
    console.log("TRANSFORMATION:EnrichGroupInfo EVENT:", event);
    return event;
}

async function GetGroupInfo(groupId, config, event){
    try {
        if(groupId){

            let base_url = config.base_url;
            if(!base_url){
                console.log('No base_url exist in config and set to https://qa.cidaas.de');
                base_url = 'https://qa.cidaas.de';
            }

            let URL = base_url + '/groups-srv/usergroup/'+groupId;
            console.log('Get GroupInfo URL: ', URL);
            let groupInfoResp = await axios.get(URL, {
                headers: {
                    "Authorization": `Bearer ${event.data.access_token}`
                }
            });
            if (!groupInfoResp || !groupInfoResp.data || groupInfoResp.status !== 200) {
                throw new Error('invalid response for groupId ' + groupId);
            }
            // console.log("GroupInfo GroupID: ", groupInfoResp.data.data.groupId)
            //const data = {groupInfo: groupInfoResp.data};
            const data = groupInfoResp.data.data;
            console.log("GroupInfo data: ", data);
            return data;

        }
    }catch(err){
        console.log("Get Custom GroupInfo err", err.message);
        throw new Error("error getting GroupInfo");
    }
}

async function validateandGetGroupInfo(event, config){
    let groupResponse = {
        data: null,
        error: null
    };
    //metaData.groupId
    try {
        if( !event || !event.metadata || !event.metadata.groupId){
            throw new Error("error missing metadata/GroupId info in the event");
        }
        let groupInfo = await GetGroupInfo(event.metadata.groupId, config, event);
        groupResponse.data = groupInfo;
    } catch(err){
        console.log("Get Custom GroupInfo err", err.message);
        //throw new Error("error validating incoming event Group data");
        groupResponse.error = err;
    }
    return groupResponse;
}