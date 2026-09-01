module.exports = function (event, ctx, config) {
    if (event.eventtype.toUpperCase() !== 'GROUP_DELETED'){
        return false;
    }
    return true;
}