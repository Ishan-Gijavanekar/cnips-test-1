module.exports = {
    setup: function(config) { /* optional */
        //setup connection
        console.log("running setup")
    },
    execute: function(event, ctx, config) { /* required */
    console.log("running execute")
    console.log("incoming event", event)
        //send to destination.
    },
    teardown: function(config) { /* optional */
        //teardown connection
        console.log("running teardown")
    }
}