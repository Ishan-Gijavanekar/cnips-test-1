module.exports = function (event, ctx, config) {
    //add your script here to transform or enrich the event

    //throw new Error("Testing js pipline failure")
    console.log('Transformed');
    //remember to return the transformed event object for the pipeline to continue processing the event
    return event;
}