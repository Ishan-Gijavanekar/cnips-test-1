module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        //send to destination.
        console.log('Event at Dest: ', event);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}