module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        //send to destination.111223
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}