module.exports = async function (event, ctx, config) {
    let gitlabRoleExists = await CheckGitlabRoleExist(event, config);
    if(!gitlabRoleExists){
        console.log("User will not be provisioned in Gitlab. Necessary roles does not exist");
        return false;
    }
    console.log("Role Exists. User has to be provisioned in Gitlab ");
    return true;
}

async function  CheckGitlabRoleExist(event, config){
    let gitlabGroupId = config.groupId;
    let gitlabGroup;
    for (let group of event.data.userInfo.groups) {
        if (group.groupId === "CIDAAS_ADMINS")
            continue;
        if (group.groupId === gitlabGroupId){
            gitlabGroup = group;
        }

    }
    if(gitlabGroup){
        console.log("Gitlab Group", gitlabGroup);
        return true;
    }
    return false;
}