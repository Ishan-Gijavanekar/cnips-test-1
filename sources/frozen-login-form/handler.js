module.exports = function(config) { /* required */
    //add your script here to pull data from your data source.
    let data = [{sub: "sub1"}, {sub: "sub2"}];
    console.log("config", config)
    //always return your data as an array.
    return data;
}