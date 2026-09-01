module.exports = function (event, ctx, config) {
 if (event.eventtype.toUpperCase() !== 'GROUP_CREATED'
      && event.eventtype.toUpperCase() !== 'GROUP_UPDATED'
      && event.eventtype.toUpperCase() !== 'GROUP_DELETED'
      ){
        console.log('DECISION:DECISION_GROUPS. INVALID EVENT TYPE');
        return false;
      }
    return true;
}