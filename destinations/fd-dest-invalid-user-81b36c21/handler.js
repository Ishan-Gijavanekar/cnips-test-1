module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        //send to destination.
        console.log('User cannot be provisioned. Reason: INVALID_USERINFO');
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}