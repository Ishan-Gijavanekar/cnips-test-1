export async function execute(event, config, vars, LOG) {
  try {
    LOG.info("Executing Transformation 1");

    const loopItem = event.item;

    if (!loopItem || !loopItem.data) {
      throw new Error("Loop item context not found. Expected event.item.data");
    }

    const originalItem = loopItem.data;

    const childItems = Array.from({ length: 5 }, (_, index) => ({
      childId: `${originalItem.id}-child-${index + 1}`,
      parentId: originalItem.id,
      childValue: `${originalItem.value}-child-${index + 1}`,
      createdAt: new Date().toISOString(),
    }));

    const transformedItem = {
      ...originalItem,
      sourceSub: event.sub,
      itemIndex: loopItem.index,
      totalItems: loopItem.totalItems,
      transformation1Done: true,
      childItems,
    };

    LOG.info("Transformation 1 processed item: %s", originalItem.id);

    return transformedItem;
  } catch (error) {
    LOG.error("Error in Transformation 1:", error);
    throw error;
  }
}