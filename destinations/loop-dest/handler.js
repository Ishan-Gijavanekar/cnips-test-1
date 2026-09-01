export async function execute(event, config, vars, LOG) {
  try {
    LOG.info("Executing destination");

    if (!Array.isArray(event)) {
      LOG.info("Destination received non-array event: %j", event);
      return;
    }

    LOG.info("Destination received final processed array with %d items", event.length);

    const preview = event.slice(0, 10);
    LOG.info("Preview of first 10 items: %j", preview);

    event.forEach((item, index) => {
      LOG.info(
        "Final result %d: parentId=%s, childId=%s, transformedChildValue=%s",
        index + 1,
        item.parentId,
        item.childId,
        item.transformedChildValue
      );
    });

    LOG.info("Destination completed successfully");
  } catch (error) {
    LOG.error("Error executing destination:", error);
    throw error;
  }
}