module.exports = {
    setup: function(config, vars) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config, vars) { /* required */
        console.log("incoming vars", vars)
        //send to destination.
    },
    teardown: function(config, vars) { /* optional */
        //teardown connection
    }
}