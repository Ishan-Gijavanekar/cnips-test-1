
export async function execute(event, config, vars, LOG) {
    try {
        /**
         * Example Logging Usage:
         */
        LOG.info(`Executing event: ${event}`);
        LOG.debug(`Config: ${JSON.stringify(config)}`);
        LOG.debug(`Vars: ${JSON.stringify(vars)}`);
        /**
         * Or you can use printf style logging:
         */
        LOG.info(`Event details: %s, Config: %j, Vars: %j`, event, config, vars);

        // Destination logic goes here
        // For example, you might send the event to an external API
        // const response = await fetch(`${config.base_url}/events`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${vars.access_token}`
        //     },
        //     body: JSON.stringify(event)
        // });

        // if (!response.ok) {
        //     throw new Error(`Failed to send event: ${response.statusText}`);
        // }

        LOG.info(`Event sent successfully: ${event}`);
    } catch (error) {
        // Log and throw meaningful errors so that its easier for debugging
        LOG.error(`Error executing event ${event}:`, error);
        throw error;
    }
}