module.exports = {
    setup: function(config, vars) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config, vars) { /* required */
        //send to destination.1
        console.log("Vars: ", vars['ash']);
    },
    teardown: function(config, vars) { /* optional */
        //teardown connection
    }
}