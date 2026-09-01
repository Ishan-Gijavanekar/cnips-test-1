module.exports = function(event, ctx, config, vars) {
    if(event.sub.length % 2 == 0){
        return true
    }
    return false
}