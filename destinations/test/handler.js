module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        //send to destination.
        console.log('change:1');
        console.log('change:2');
        console.log('change:3');

    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}