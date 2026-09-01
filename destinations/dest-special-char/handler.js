module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('Config: ', config);
        //send to destination.
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}