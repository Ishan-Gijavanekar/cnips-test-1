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
        // access defin ed config f or this function from the request headers

        // Your business logic here

        LOG.info(`Received request ${req.body}`);
        LOG.info(`Received headers ${req.headers.ash}`);
        return res.json({ data: "whereis2" })

    } catch (error) {
        LOG.error(`Error processing request: ${error.message}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}