module.exports = function (event, ctx, config, vars) {
    getData().then(data => console.log(data))
    console.log("vars", vars)
    return event;
}

async function getData() {
    console.log("throwing error")
    console.log("throwing error")
    throw new Error("Promise Error Message")
}