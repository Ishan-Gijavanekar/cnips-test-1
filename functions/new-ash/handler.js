module.exports = function (req, res, config) {
    //add you api logic here
console.log("hello from console");
    //remember to return the response
    return res.json({message: "hello world."});
}