module.exports = function (event, ctx, config) {
    //console.log('DBB Incoming Event: ', event);
let userInfo = event.data.userData;
//console.log('DBBB UserInfo: ', userInfo);
    let valid = isCidaasUserAccountValid(userInfo) && isCidaasUserIdentityValid(userInfo)
    if(!valid){
        console.log("user cannot be provisioned. invalid userInfo");
        return false;
    }
    return true;
}

function isCidaasUserAccountValid(userInfo) {
    return !!userInfo
        && !!userInfo.userAccount.userStatus;
}

function isCidaasUserIdentityValid(userInfo) {
    return !!userInfo.identity && !!userInfo.identity
    && !!userInfo.identity.sub
    && !!userInfo.identity.given_name
    && !!userInfo.identity.family_name
    && !!userInfo.identity.email;
}