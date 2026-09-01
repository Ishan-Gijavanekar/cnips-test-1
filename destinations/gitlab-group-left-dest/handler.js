const axios = require("axios");
module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) { /* required */
        let groupLeftResponse = await handleGroupLeftEvent(event, config);
        event.gitlabResponse = groupLeftResponse;
       console.log("updateResponse: ", groupLeftResponse);
       console.log("DEST:gitlab_group_left_dest, EVENT: ", event);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}

async function handleGroupLeftEvent(event, config){
    let responseObject = {
        blockGitlabUser: false,
        data: null,
        error: null
    };
    try{
        let gitlabId = event.data.userInfo.userAccount.customFields.gitlabid;
        let gitlabUserResponse = await GetGitlabUser(config, gitlabId);
        if(!gitlabUserResponse || !gitlabUserResponse.data || !gitlabUserResponse.data.id){
            console.log("No Action needed. Reason: User not found in Gitlab");
            responseObject.data = "No Action needed. Reason: User not found in Gitlab";
            return responseObject;
        }
        let changeStateResponse = await ChangeGitlabState(gitlabId, GitlabUserStatusAction.BLOCK, config);
        if(!changeStateResponse.status || changeStateResponse.status != 200){
            console.log("error handling change event. ChangeState Gitlab response: ", changeStateResponse)
            responseObject.error = changeStateResponse;
            return responseObject;
        }
        responseObject.blockGitlabUser = true;
        return responseObject;

    } catch(error){
        console.log("DEST:gitlab_group_left_dest ERROR: ", error.message);
        responseObject.error = error.message;
        return responseObject;
    }

}



async function GetGitlabUser(config, gitlabId){
    try {
        let url = config.base_url + 'api/v4/users/' + gitlabId + '?access_token=' + config.gitlab_token;
        let response = await axios.get(url);
        if(!response || !response.data || response.status != 200){
            console.log("error getting data from gitlab for user ", gitlabId);
            return null;
        }
        return response;
    } catch(err){
        console.log("error getting data from gitlab ", err );
        console.log("TRANSFORMATION:UpdateGitlab FUNCTION: GetGitlabUser ERROR: ", err.message);
        return null;
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
    let response =  axios.post(url, null, {
        validateStatus: (status) => { return true },
    });
    return response;
}