const axios = require("axios");
const { v4: uuidv4 } = require('uuid');
module.exports = async function (event, ctx, config) {
    let responseObject = {
        createGitlabUser: false,
        data: null,
        error: null,
    };
    let groups = event.data.userData.groups;
    let identity = event.data.userData.identity;
    if(!groups){
        console.log('TRANSFORMATION: Gitlab  account cannot be created. Reason: groups does not exist for the  user');
    }
    let createGitlabUser = await CheckGitlabRoleExist(config,groups)
    if (createGitlabUser){
        responseObject = await CreateAndDeactivateUser(groups, config, identity);
    } else {
        console.log('TRANSFORMATION: GL_CREATE_USER_XFROM Gitlab account cannot be created. Reason: necessary role does not exist');
    }
    event.data.gitlabResponse = responseObject;
    console.log("gitlabResponse set to: ", event.data.gitlabResponse);
    console.log("TRANFORMATION:GL_CREATE_USER_XFROM:EVENT:", event);
    return event;
}

async function  CheckGitlabRoleExist(config, groups){
    let gitlabGroup = getGitlabGroup(config, groups);
    if(gitlabGroup && gitlabGroup.roles ){
        return true;
    }
    return false;
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

async function CreateAndDeactivateUser(groups, config, identity){
    let responseObject = {
        createGitlabUser: false,
        data: null,
        error: null
    };
    try {
        let group = getGitlabGroup(config, groups);
        let response = await axios.post(config.gitlab_url + '/api/v4/users?access_token=' + config.gitlab_token, {
            email: identity.email,
            name: identity.given_name + ' ' + identity.family_name,
            username: replaceMutatedVowels(identity.given_name.toLowerCase() + '.' + identity.family_name.toLowerCase()),
            admin: group.roles.includes('System Administrator'),
            external: group.roles.includes('External'),
            skip_confirmation: true,
            //password: uuidv4()
            password: generatePassword(12)
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response || !response.data || response.status !== 201 || response.data.id) {
            console.log('error creating Gitlab user. response status', response.status, " response data: ", response.data);
            return responseObject;
        }
        responseObject.createGitlabUser = true;
        responseObject.data = response.data;
        let changeStateResponse = await ChangeGitlabState(response.data.id, GitlabUserStatusAction.DEACTIVATE, config);
        if(!changeStateResponse.status || changeStateResponse.status != 200){
            console.log("error handling change event. ChangeState Gitlab response: ", changeStateResponse)
            responseObject.error = changeStateResponse;
            return responseObject;
        }
        return responseObject;
    } catch (err){
        responseObject.error = err.message;
        console.log('error creating / deactivating user in Gitlab', err.message);
        return responseObject;
    }

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

function generatePassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
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
