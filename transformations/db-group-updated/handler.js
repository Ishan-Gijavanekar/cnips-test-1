module.exports = function (event, ctx, config) {
    if (event.eventtype.toUpperCase() !== 'GROUP_UPDATED'){
        return false;
    }
    return true;
}