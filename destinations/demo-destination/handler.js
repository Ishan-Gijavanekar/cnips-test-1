module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('Hello Cnips!"');
        console.log('Event Received', event);
        //send to destination.
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}