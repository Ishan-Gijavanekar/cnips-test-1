module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('Event at end of Freshdesk flow: ', event);
        console.log('No Freshdesk Contact has been created');
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}