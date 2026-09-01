module.exports = function (req, res, config) {
    //add you api logic here
    console.log(req)
    let body = req.body;

    //remember to return the response
    return res.json({env: process.env, body: body});
}