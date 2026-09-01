module.exports = function (event, ctx, config) {
    if( !event.data || !event.data.userInfo.userAccount.customFields
    || !event.data.userInfo.userAccount.customFields.gitlabid ){
        console.log("Cannot be processed further. Customfield does not exist");
        return false;
    }
    return true;
}