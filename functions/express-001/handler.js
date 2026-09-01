const { logger, levels } = require("@cnips/log");

const LOG = logger(process.env.APP || "default", levels.info)

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
            LOG.error("Client ID is missing in the request headers");
            return res.status(400).json({ error: "Client ID is required" });
        }
        LOG.info("executing function...")

        // Your business logic here

        LOG.info(`Received request ${JSON.stringify(req.body)}`);
        return res.json({ data: "pong" })

    } catch (error) {
        LOG.error(`Error processing request: ${error.message}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}