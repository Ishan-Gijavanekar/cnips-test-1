import { logger, levels } from "@cnips/log";

const LOG = logger(process.env.APP || "default", levels.info)

/**
 * Your expressjs handler function.
 * @param {Request} req 
 * @param {Response} res 
 * @returns 
 */
async function buildRequest(req, res) {
    try {
        // access defined config for this function from the request headers 
        let client_id = req.headers["client_id"];
        let client_ids = req.headers["client_ids"];
        if (!client_id) {
            LOG.error("Client ID is missing in the request headers");
            return res.status(400).json({ error: "Client ID is required" });
        }

        // Your business logic here
        LOG.info("Hello");

        LOG.info(`Received request ${req.body}`);
        return res.json({ message: "pong" })

    } catch (error) {
        LOG.error(`Error processing request: ${error.message}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const handleRequest = buildRequest;