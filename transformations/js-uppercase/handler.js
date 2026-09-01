module.exports = function (event, ctx, config) {
    //add your script here to transform or enrich the event
    console.log("running uppercase");
    event.message = event.message.toUpperCase();
    //remember to return the transformed event object for the pipeline to continue processing the event
    return event;
}