export async function execute(config, vars, LOG) {
    try {
        /**
         * Example Logging Usage:
         */
        LOG.info(`Executing extractor`);
        LOG.debug(`Config: ${JSON.stringify(config)}`);
        LOG.debug(`Vars: ${JSON.stringify(vars)}`);

        /**
         * Or you can use printf style logging:
         */
        LOG.info("Config: %j, Vars: %j", config, vars);

        // Generate array of 100 items
        const generateItems = (prefix) => {
            return Array.from({ length: 100 }, (_, index) => ({
                id: `${prefix}-${index + 1}`,
                value: `sample-value-${index + 1}`,
                createdAt: new Date(),
            }));
        };

        // Sample extracted data with 2 events
        // Each event contains an array of 100 objects
        let extractedData = [
            {
                sub: "abcd",
                timestamp: new Date(),
                items: generateItems("event1"),
                testItems: generateItems("sum1"),
            },
            {
                sub: "abcdef",
                timestamp: new Date(),
                items: generateItems("event2"),
                testItems: generateItems("sum2"),
            }
        ];


        

        return extractedData;

    } catch (error) {
        // Log and throw meaningful errors so that its easier for debugging
        LOG.error(`Error running extractor:`, error);
        throw error;
    }
}