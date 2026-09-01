export async function execute(event, config, vars, LOG) {
  try {
    LOG.info("Executing Transformation 2");

    const loopItem = event.item;

    if (!loopItem || !loopItem.data) {
      throw new Error("Loop item context not found. Expected event.item.data");
    }

    const childItem = loopItem.data;

    const transformedChild = {
      processed: true,
      childIndex: loopItem.index,
      totalChildItems: loopItem.totalItems,
      parentId: childItem.parentId,
      childId: childItem.childId,
      originalChildValue: childItem.childValue,
      transformedChildValue: `${childItem.childValue}-processed`,
      processedAt: new Date().toISOString(),
    };

    LOG.info(
      "Transformation 2 processed child item %d/%d: %s",
      loopItem.index + 1,
      loopItem.totalItems,
      childItem.childId
    );

    return transformedChild;
  } catch (error) {
    LOG.error("Error in Transformation 2:", error);
    throw error;
  }
}