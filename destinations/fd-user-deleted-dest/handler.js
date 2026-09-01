module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
       console.log('User deleted successfully');
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}