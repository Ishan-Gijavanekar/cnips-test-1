module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log("incoming event", event);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}