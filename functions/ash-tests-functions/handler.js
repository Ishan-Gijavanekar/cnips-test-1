

/**
 * Your expressjs handler function.
 * @param {Request} req 
 * @param {Response} res 
 * @returns 
 */
async function handleRequest(req, res) {
    try {
        // access defined config for this function from the request headers
        let client_id = req.headers["client_id"];
        if (!client_id) {
            return res.status(400).json({ error: "Client ID is required" });
        }

        // Your business logic here

        console.log(`Received request ${req.body}`);
        return res.json({ data: "pong" })

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}