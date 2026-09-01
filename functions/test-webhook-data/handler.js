module.exports = function (req, res, config) {
    //add you api logic here

    //remember to return the response
    return res.json({sucess: true, data:req.body});
}