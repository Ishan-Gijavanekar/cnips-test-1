module.exports = {
    setup: function(config, vars) { /* optional */
        console.log("destination setup")
        //setup connection
    },
    execute: function(event, ctx, config, vars) { /* required */
        //send to destination.
        console.log(vars);
        console.log("incoming event", event)
    },
    teardown: function(config, vars) { /* optional */
        //teardown connection
        console.log("destination teardown")
    }
}