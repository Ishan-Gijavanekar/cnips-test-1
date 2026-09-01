module.exports = function(config) { /* required */
    //add your script here to pull data from your data source.
    console.log("config", config)
    console.log("test extractor")
    return [{message: "hello"}]
}