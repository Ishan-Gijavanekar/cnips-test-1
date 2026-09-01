module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log("User left group");
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}