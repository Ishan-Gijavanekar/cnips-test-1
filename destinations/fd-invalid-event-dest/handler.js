module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('invalid event ');
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}