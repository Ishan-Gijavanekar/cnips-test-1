module.exports = {
    setup: function(config, vars) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config, vars) { /* required */
        //send to destination.
        console.log("incoming event", event)
    },
    teardown: function(config, vars) { /* optional */
        //teardown connection
    }
}