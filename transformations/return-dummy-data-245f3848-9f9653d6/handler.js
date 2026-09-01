module.exports = function (event, ctx, config) {
    //add your script here to transform or enrich the event
event.dummy = "this is a demo";
    //remember to return the transformed event object for the pipeline to continue processing the event
    return event;
}