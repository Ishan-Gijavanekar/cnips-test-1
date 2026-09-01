const axios = require("axios");
module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) { /* required */
        let handleEventResponse = CheckAndHandleUpdateEvents(event, config);
        event.data.handleEventResponse = handleEventResponse;
        console.log("DESTINATION:HandleUpdateEvent, EVENT: ", event);
        return event;
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}

async function CheckAndHandleUpdateEvents(event, config){
    let responseObject = {
        handledEvent: false,
        data: null,
        error: null
    };
    try{
        if(!event.data || !event.data.userInfo.userAccount || !event.data.userInfo.userAccount.customFields || !event.data.userInfo.userAccount.customFields.gitlabid){
            console.log("User will not be provisioned in Gitlab. Necessary customField GilabId does not exist");
            return responseObject;
        }
        let type = event.eventtype.toUpperCase();
        let gitlabId = event.data.userInfo.userAccount.customFields.gitlabid;
        let stateChangeResponse = null;
        if(type == "ACCOUNT_ACTIVATED"){
            stateChangeResponse = await ChangeGitlabState(gitlabId, GitlabUserStatusAction.UNBLOCK, config);
            if(stateChangeResponse.result){
                console.log("Ublocked user ", gitlabId);
                stateChangeResponse = await ChangeGitlabState(gitlabId, GitlabUserStatusAction.DEACTIVATE, config);

            }
        } else if(type == "ACCOUNT_DEACTIVATED" || type == "GROUP_USER_REMOVED"){
            stateChangeResponse = await ChangeGitlabState(gitlabId, GitlabUserStatusAction.BLOCK, config);
        } else {
            console.log("No Action needed for this eventtype ", event.eventtype);
            return responseObject;
        }
        if(!stateChangeResponse || stateChangeResponse.status != 200){
            console.log("error handling change event. ChangeState Gitlab response: ", stateChangeResponse)
            responseObject.error = stateChangeResponse;
            return responseObject;
        }
        responseObject.handledEvent = true;
        return responseObject;
    } catch(err){
        console.log("error handling Update event  ", err.message);
        responseObject.error = err;
        return responseObject;
    }
}

let  GitlabUserStatusAction = {
    ACTIVATE : 'activate',
    DEACTIVATE : 'deactivate',
    UNBLOCK : 'unblock',
    BLOCK : 'block'
};

async function ChangeGitlabState(gitlabId, state, config){
    let url = config.gitlab_url + 'api/v4/users/' + gitlabId + '/' + state + '?access_token=' +config.gitlab_token;
    let response =  await axios.post(url, null, {
        validateStatus: (status) => { return true },
    });
    return response;
}
