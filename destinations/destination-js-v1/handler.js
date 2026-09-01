module.exports = {
    setup: function(config) { /* optional */
        //setup connection
    },
    execute: function(event, ctx, config) { /* required */
        console.log("Executing destination-js-v1 with event: ", event);
        const resukt = prime(event.number);
        console.log("Result of prime check: ", resukt);
    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}

function prime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}
