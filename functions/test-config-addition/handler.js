module.exports = function (req, res) {
    //add you api logic here
    let config = {
        test: req.query.test,
        test2: req.query.test2
    }

    //remember to return the response
    return res.json({message: "hello world.", config: config});
}