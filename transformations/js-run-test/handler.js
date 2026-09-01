module.exports = function (event, ctx, config, vars) {
    //add your script here to transform or enrich the event
    console.log("incoming event ", event)
    //remember to return the transformed event object for the pipeline to continue processing the event
    return event;
}