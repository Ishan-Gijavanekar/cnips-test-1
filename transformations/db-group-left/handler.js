module.exports = function (event, ctx, config) {

    if (event.eventtype.toUpperCase() !== 'GROUP_USER_REMOVED'){
        return false;
    }
    return true;
}