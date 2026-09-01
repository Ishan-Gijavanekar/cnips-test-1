module.exports = function (event, ctx, config) {
    if (event.eventtype.toUpperCase() !== 'ACCOUNT_DELETED'){
        return false;
    }
    return true;
}