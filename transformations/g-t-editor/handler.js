module.exports = function (event, ctx, config, vars) {
    //add your script here to check conditions for decision
    const why = "is this always true"
    why == true;
    console.log("gibcen")
    //remember to return boolean true/false value, otherwise ppipelline will stop processing
    return {"gibcen":"istesting"};
}