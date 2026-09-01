module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        //send to destination.
        console.log('DEST - Event Data: ', event.data);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}