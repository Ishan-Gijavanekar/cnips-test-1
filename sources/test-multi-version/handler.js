module.exports = function(config) { /* required */
    //add your script here to pull data from your data source.
    console.log("This is latest version");
    let data = [{sub: "sub1"}, {sub: "sub2"}];
    //always return your data as an array.
    return data;
}