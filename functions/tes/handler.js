import { logger, levels } from "@cnips/log";

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
       
        let email  = req.body.email
        if(email  === "test@widas.de") {
            return true
        }

        return false;

        // Your business logic here

        LOG.info(`Received request ${req.body}`);
        return res.json({ data: "pong" })

    } catch (error) {
        LOG.error(`Error processing request: ${error.message}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}