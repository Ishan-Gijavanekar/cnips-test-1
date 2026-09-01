module.exports = function (event, ctx, config) {
 if (event.eventtype.toUpperCase() !== 'ACCOUNT_CREATED_WITH_CIDAAS_IDENTITY'
      && event.eventtype.toUpperCase() !== 'ACCOUNT_CREATED_WITH_SOCIAL_IDENTITY'
      && event.eventtype.toUpperCase() !== 'ACCOUNT_MODIFIED'
      && event.eventtype.toUpperCase() !== 'ACCOUNT_ACTIVATED'
      && event.eventtype.toUpperCase() !== 'ACCOUNT_DEACTIVATED'
      && event.eventtype.toUpperCase() !== 'GROUP_USER_ROLE_UPDATED'
      && event.eventtype.toUpperCase() !== 'ACCOUNT_DELETED'
      && event.eventtype.toUpperCase() !== 'GROUP_NEW_USER_ADDED'
      && event.eventtype.toUpperCase() !== 'GROUP_USER_REMOVED'){
        return false;
      }
    return true;
}