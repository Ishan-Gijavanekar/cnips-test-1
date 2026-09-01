module.exports = function (event, ctx, config) {
    if (event.eventtype.toUpperCase() !== 'GROUP_CREATED'){
        return false;
    }
    return true;
}