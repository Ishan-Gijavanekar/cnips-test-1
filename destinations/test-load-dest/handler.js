module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('Event at Dest2: ', event);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}