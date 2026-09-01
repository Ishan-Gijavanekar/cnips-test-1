const { logger, levels } = require("@cnips/log");

const LOG = logger(process.env.APP || "default", levels.info)

/**
 * Your expressjs handler function.
 * @param {Request} req 
 * @param {Response} res d
 * @returns s
 */
async function handleRequest(req, res) {
    try {
        // access defined config for this function from the request headers
        let client_id = req.headers["client_id"];
        if (!client_id) {
            LOG.error("Client ID is missing in the request headers");
            return res.status(400).json({ error: "Client ID is required" });
        }
        //console.log(req.env)

        // Your business logic here

        LOG.info(`Received request ${req.body}`);
        return res.json({ data: "pong" , "name":"gibcen"})

    } catch (error) {
        LOG.error(`Error processing request: ${error.message}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}