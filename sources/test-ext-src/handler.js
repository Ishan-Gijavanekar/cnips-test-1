module.exports = function(config) { /* required */
    //add your script here to pull data from your data source.
    let data = [{sub: "sub1"}, {sub: "sub2"}];
    //always return your data as an array.
    console.log('returning ext data - 1: ', data);
    return data;
}