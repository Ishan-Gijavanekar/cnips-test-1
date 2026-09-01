module.exports = function (event, ctx, config) {
    if(event.message.length % 2 == 0) {
        return false
    }
    return true;
}