module.exports = {
    setup: function (config) { /* optional */
        //setup connection
    },
    execute: function (event, ctx, config) { /* required */
        //send to destination.
    },
    teardown: function (config) { /* optional */
        //teardown connection
    }
}