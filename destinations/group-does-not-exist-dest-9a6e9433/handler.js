module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        //send to destination.
        console.log('User will not be provisioned. Reason: Necessary group does not exist');
        console.log('Event at destination. ', event);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}