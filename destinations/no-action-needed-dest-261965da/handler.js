module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        //send to destination.
        console.log('No Action needed');
        console.log('DESTINATION: NO_ACTION_NEEDED_DEST. Event:', event);
        return event;
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}