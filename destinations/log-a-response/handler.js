module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config, vars) { /* required */
        //send to destination.
        console.log('THIS IS DESTINATION');
        console.log(event)
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}