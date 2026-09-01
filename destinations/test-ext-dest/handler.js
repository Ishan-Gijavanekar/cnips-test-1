module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        //send to destination.
        console.log('Dest1: ', event);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}