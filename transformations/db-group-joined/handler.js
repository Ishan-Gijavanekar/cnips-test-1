module.exports = function (event, ctx, config) {
    if (event.eventtype.toUpperCase() !== 'GROUP_NEW_USER_ADDED'){
        return false;
    }
    return true;
}