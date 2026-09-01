module.exports = function (event, ctx, config) {
    if (event.eventtype.toUpperCase() !== 'ACCOUNT_CREATED_WITH_CIDAAS_IDENTITY'
        && event.eventtype.toUpperCase() !== 'ACCOUNT_CREATED_WITH_SOCIAL_IDENTITY'){
        return false
    }
    return true
}