module.exports = function (event, ctx, config) {
    //add your script here to transform or enrich the event

    //remember to return the transformed event object for the pipeline to continue processing the event
    if(event.key === "val"){
        throw new Error('Testing to stop exec');
    }
    
    return event;
}