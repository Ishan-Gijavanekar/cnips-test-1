module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log('Group Deleted');
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}