module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log("User Joined Group successfully");
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}