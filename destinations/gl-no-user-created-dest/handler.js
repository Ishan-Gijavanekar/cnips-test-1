module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
    
        console.log('No Gitlab User has been created');
        console.log("DESTINATION:GL_NO_USER_CREATED_DEST. EVENT: ", event);

    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}