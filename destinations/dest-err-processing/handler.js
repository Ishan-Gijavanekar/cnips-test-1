module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('Incoming destination');
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}