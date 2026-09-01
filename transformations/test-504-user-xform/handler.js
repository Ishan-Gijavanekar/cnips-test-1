const axios = require("axios");
module.exports = async function (event, ctx, config) {
    //add your script here to transform or enrich the event
    let userInfoInternal = await getUserAccount(config, event, event.data.access_token);
    console.log('UserInfoInternal: ', userInfoInternal);
    event.data.UserInfo = userInfoInternal;
    //remember to return the transformed event object for the pipeline to continue processing the event
    return event;
}

async function getUserAccount(config, event, token){
    try {
        console.log('Token Data: ', token);
        let userinfoURL = config.base_url + `/users-srv/internal/userinfo/profile/${event.sub}`;
        let userInfoResp = await axios.get(userinfoURL, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        let data = userInfoResp.data;
        //console.log('DATAAA', data.data);
        return data.data;

    } catch (err){
        console.log("getUserInfo err", err.message);
        throw new Error("error getting getUserInfo" + err);
    }
}