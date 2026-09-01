const axios = require("axios");
module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) { /* required */
        let deleteGitlabResponse = await deleteGitlabUser(event, config);
        event.data.gitlabResponse = deleteGitlabResponse;
        console.log("DESTINATION:deleteGitlabUser, EVENT: ", event);
        return event;
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}

async function deleteGitlabUser(event, config){
    let responseObject = {
        deleteGitlabUser: false,
        data: null,
        error: null
    }
    try {
        if (!event.metaData || !event.metaData.customFields || !event.metaData.customFields.gitlabid
            || !event.metaData.customFields.gitlabid.value || !event.metaData.email) {
                console.log("GitlabId/email missing in the event. Cannot be processed further!");
                responseObject.data = "GitlabId/email does not exist in the event";
                return responseObject;
            }
            let gitlabUserResponse = await getGitlabUserbyEmail(event.metaData.email, config);
            if(!gitlabUserResponse || !gitlabUserResponse.data){
                responseObject.error = gitlabUserResponse;
                return responseObject;
            }

            let changeStateResponse = await ChangeGitlabState(event.metaData.customFields.gitlabid, GitlabUserStatusAction.BLOCK, config);
            if(!changeStateResponse.status || changeStateResponse.status != 200){
                console.log("error handling change event. ChangeState Gitlab response: ", changeStateResponse)
                responseObject.error = changeStateResponse;
                return responseObject;
            }
            responseObject.deleteGitlabUser = true;
            return responseObject;

        } catch(err){
            responseObject.error = err;
            console.log("error processing deleteUser in Gitlab", err.message);
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
    let response =  axios.post(url, null, {
        validateStatus: (status) => { return true },
    });
    return response;
}

async function getGitlabUserbyEmail(email, config){
    let url = config.gitlab_url + 'api/v4/users?search=' + email + '&access_token=' +config.gitlab_token;
    let response =  await axios.get(url);
    if (!response || !response.data || !response.data || response.status !== 200) {
        console.log("non success status getting gitlab user by email", response);
    }
    return response;
}