module.exports = function (event, ctx, config) {
    if (event.eventtype.toUpperCase() !== 'ACCOUNT_MODIFIED'
      && event.eventtype.toUpperCase() !== 'ACCOUNT_ACTIVATED'
      && event.eventtype.toUpperCase() !== 'ACCOUNT_DEACTIVATED'
      && event.eventtype.toUpperCase() !== 'GROUP_USER_ROLE_UPDATED'){
        return false;
      }
      return true;
}