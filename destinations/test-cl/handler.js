module.exports = {
    setup: function(config, vars) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config, vars) { /* required */
        //send to destination.
        console.log('Updated2!!');
    },
    teardown: function(config, vars) { /* optional */
        //teardown connection
    }
}