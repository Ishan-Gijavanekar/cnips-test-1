module.exports = function (event, ctx, config) {
    //add your script here to check conditions for decision
    console.log("hello")
    //remember to return boolean true/false value, otherwise ppipelline will stop processing
    return true;
}