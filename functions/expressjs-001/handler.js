module.exports = function (req, res) {
    //add your script here to transform or enrich the event

    //remember to return the transformed event object for the pipeline to continue processing the event
    return res.json({"env": process.env});
}