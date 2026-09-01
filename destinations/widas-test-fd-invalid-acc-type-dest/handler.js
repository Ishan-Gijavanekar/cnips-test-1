module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('Freshdesk Account cannot be configured Reason: INVALID EVENTTYPE. Event Type: ', event.eventtype);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}