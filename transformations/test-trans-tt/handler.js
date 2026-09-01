export async function execute(event, config, vars, LOG) {
    try {
        LOG.info("Executing loop item transformation");
        LOG.debug("Raw loop event: %j", event);
        LOG.debug("Config: %j", config);
        LOG.debug("Vars: %j", vars);

        const loopItem = event.item;

        if (!loopItem || !loopItem.data) {
            throw new Error("Loop item context not found. Expected event.item.data");
        }

        const originalItem = loopItem.data;

        const transformedEvent = {
            processed: true,
            itemIndex: loopItem.index,
            batchIndex: loopItem.batchIndex,
            batchNumber: loopItem.batchNumber,
            totalItems: loopItem.totalItems,
            sourceSub: event.sub,
            originalItem,
            transformedValue: `${originalItem.value}-processed`,
            processedAt: new Date().toISOString(),
        };

        LOG.info(
            "Processed item %d/%d: %s",
            loopItem.index + 1,
            loopItem.totalItems,
            originalItem.id
        );



        

        LOG.debug("Transformed loop item: %j", transformedEvent);

        return transformedEvent;

    } catch (error) {
        LOG.error("Error processing loop item:", error);
        throw error;
    }
}