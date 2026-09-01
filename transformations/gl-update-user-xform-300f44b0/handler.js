const axios = require("axios");
async function execute(event, ctx, config) {
    let updateResponse = await CheckAndUpdateGitlabUser(event, config);
    event.gitlabResponse = updateResponse;
    console.log("updateResponse: ", updateResponse);
    console.log("TRANSFORMATION:UpdateGitlab, EVENT: ", event);
}

function getGitlabGroup(config, groups){
    let gitlabGroupId = config.groupId;
    let gitlabGroup;
    for (let group of groups) {
        if (group.groupId === "CIDAAS_ADMINS")
            continue;
        if (group.groupId === gitlabGroupId){
            gitlabGroup = group;
        }
    }
    return gitlabGroup;
}

function replaceMutatedVowels(str ){
    let newStr = '' + str;

    if (newStr.indexOf('ö') <= 0)
        newStr = newStr.replace('ö', 'oe');

    if (newStr.indexOf('ä') <= 0)
        newStr = newStr.replace('ä', 'ae');

    if (newStr.indexOf('ü') <= 0)
        newStr = newStr.replace('ü', 'ue');

    if (newStr.indexOf('Ä') <= 0)
        newStr = newStr.replace('Ä', 'Ae');

    if (newStr.indexOf('Ö') <= 0)
        newStr = newStr.replace('Ö', 'Oe');

    if (newStr.indexOf('Ü') <= 0)
        newStr = newStr.replace('Ü', 'Ue');

    if (newStr.indexOf('ß') <= 0)
        newStr = newStr.replace('ß', 'ss');

    return newStr;
}

async function  CheckAndUpdateGitlabUser(event, config){
    let responseObject = {
        updateGitlabUser: false,
        data: null,
        error: null
    };
    try {
        if(!event || !event.data || !event.data.userInfo || !event.data.userInfo.groups || !event.data.userInfo.identity || !event.data.userInfo.userAccount){
            console.log("missing required userinfo userAccount/identity/group data to provision user in Gitlab");
            return responseObject;
        }
        let groups = event.data.userInfo.groups;
        let gitlabGroup = getGitlabGroup(config, groups);
        if(!gitlabGroup){
            console.log("User will not be provisioned in Gitlab. Necessary roles/grouos does not exist");
            return responseObject;
        }
        if(!event.data.userInfo.userAccount.customFields || !event.data.userInfo.userAccount.customFields.gitlabid){
            console.log("User will not be provisioned in Gitlab. Necessary customField GitlabId does not exist");
            return responseObject;
        }
        let gitlabId = event.data.userInfo.userAccount.customFields.gitlabid
        let gitlabUserResponse = await GetGitlabUser(config, gitlabId);
        if(!gitlabUserResponse || !gitlabUserResponse.data || !gitlabUserResponse.data.id){
            console.log("User will not be provisioned in Gitlab. Not found in Gitlab");
            return responseObject;
        }
        let identity = event.data.userInfo.identity;
        let updateObject =  GetUpdateObject(config, gitlabUserResponse.data, identity, gitlabGroup);
        if(!updateObject  || Object.keys(updateObject).length === 0){
            console.log("No changes needed in Gitlab.");
            return responseObject;
        }
        let updateGitlabResponse = await UpdateUserGitlab(updateObject, config, gitlabId);
        if(!updateGitlabResponse || !updateGitlabResponse.data || !updateGitlabResponse.data.id){
            console.log("update user in Gitlab failed. ");
            return responseObject;
        }
        responseObject.data = updateGitlabResponse.data;
        //Change state in Gitlab
        if(event.eventtype.toLowerCase() === 'ACCOUNT_ACTIVATED'.toLowerCase() ||
            event.eventtype.toLowerCase() === 'ACCOUNT_DEACTIVATED'.toLowerCase() ){
            let changeStateResponse;
            if(event.eventtype.toLowerCase() === 'ACCOUNT_ACTIVATED'.toLowerCase()){
                changeStateResponse = await ChangeGitlabState(gitlabId, GitlabUserStatusAction.UNBLOCK, config);
            } else if(event.eventtype.toLowerCase() === 'ACCOUNT_DEACTIVATED'.toLowerCase()){
                changeStateResponse = await ChangeGitlabState(gitlabId, GitlabUserStatusAction.BLOCK, config);
            } else if(event.eventtype.toLowerCase() === 'GROUP_NEW_USER_ADDED'.toLowerCase()){
                if(responseObject.data.state && responseObject.data.state == "blocked"){
                    changeStateResponse = await ChangeGitlabState(gitlabId, GitlabUserStatusAction.UNBLOCK, config);
                }
                changeStateResponse = await ChangeGitlabState(gitlabId, GitlabUserStatusAction.DEACTIVATE, config);
            }
            if(!changeStateResponse.status || changeStateResponse.status != 200){
                console.log("error handling change event. ChangeState Gitlab response: ", changeStateResponse)
                responseObject.error = changeStateResponse;
                return responseObject;
            }
        }
        responseObject.updateGitlabUser = true;
        return responseObject;
    } catch(err){
        console.log("TRANSFORMATION:UpdateGitlab FUNCTION: CheckAndUpdateGitlabUser ERROR: ", err.message);
        responseObject.error = err;
        return responseObject;
    }
}

function GetUpdateObject(config, gitlabUserData, identity, gitlabGroup){
    let name  = identity.given_name + ' ' + identity.family_name;
    let gitName = replaceMutatedVowels(name);
    let propsToUpdate = {};
    if (gitlabUserData.name !== gitName) {
        propsToUpdate.name = gitName;
    }
    let external = group.roles.includes('External');
    if (gitlabUserData.external !== external) {
        propsToUpdate.external = external;
    }
    let admin = group.roles.includes('System Administrator');
    if (gitlabUserData.is_admin !== admin) {
        propsToUpdate['admin'] = admin;
    }
    let username = replaceMutatedVowels(identity.given_name.toLowerCase() + '.' + identity.family_name.toLowerCase());
    if (gitlabUserData.username !== username) {
        propsToUpdate.username = username;
    }
    if (gitlabUserData.email !== identity.email) {
        propsToUpdate.email = identity.email;
        propsToUpdate['skip_confirmation'] = true;
    }
    return propsToUpdate;
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

async function UpdateUserGitlab(updateObject, config, gitlabId){
    try {
        let response = await axios.put(config.base_url + 'api/v4/users/' + gitlabId + '?access_token=' + config.gitlab_token,
            updateObject, {
                headers: {
                    'Content-type': 'application/json',
                }
            });
        if(!response || !response.data || response.status != 200){
            console.log("error updating Gitlab for  user ", gitlabId);
            return null;
        }
        return response;
    } catch(err){
        console.log("error updating user in gitlab ", err );
        console.log("TRANSFORMATION:UpdateGitlab FUNCTION: UpdateUserGitlab ERROR: ", err.message);
        throw err;
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
