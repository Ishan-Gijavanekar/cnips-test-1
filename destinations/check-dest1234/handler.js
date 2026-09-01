export async function execute(event, config, vars, LOG) {
    try {
        LOG.info("Executing destination");
        LOG.debug("Destination received event: %j", event);
        LOG.debug("Config: %j", config);
        LOG.debug("Vars: %j", vars);

        if (!Array.isArray(event)) {
            LOG.info("Destination received non-array event");
            LOG.info("Event: %j", event);
            return;
        }

        LOG.info("Destination received processed array with %d items", event.length);

        const preview = event.slice(0, 5);

        LOG.info("First 5 processed items: %j", preview);

        event.forEach((item, index) => {
            LOG.info(
                "Processed result %d: id=%s, sourceSub=%s, transformedValue=%s",
                index + 1,
                item.originalItem?.id,
                item.sourceSub,
                item.transformedValue
            );
        });


        

        LOG.info("Destination completed successfully");

    } catch (error) {
        LOG.error("Error executing destination:", error);
        throw error;
    }
}