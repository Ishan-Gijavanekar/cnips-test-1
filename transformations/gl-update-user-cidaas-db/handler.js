module.exports = function (event, ctx, config) {
 if(event && event.data && event.data.gitlabResponse &&
    event.data.gitlabResponse.createGitlabUser && event.data.gitlabResponse.data.id){
        return true;
    }
    console.log("No update required in Cidaas. Reason: GitlabId does not present in the event");
    console.log("DECISION:GL_UPDATE_USER_CIDAAS_DB Event: ", event);
    return false;
}