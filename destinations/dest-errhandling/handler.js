module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('err handled, incoming daatta:  ', event);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}