module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('Config: ', config);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}