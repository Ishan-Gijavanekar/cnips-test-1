module.exports = {
    setup: function(config, vars) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config, vars) { /* required */
        //send to destination.
        const product = multiply(event.x, event.y);
        console.log("Result of multiplication: ", product);
    },
    teardown: function(config, vars) { /* optional */
        //teardown connection
    }
}

function multiply (a, b) {
    return a * b;
}
