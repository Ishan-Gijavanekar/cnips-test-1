export async function execute(config, vars, LOG) {
  try {
    LOG.info("Executing extractor");

    const generateItems = (prefix) => {
      return Array.from({ length: 100 }, (_, index) => ({
        id: `${prefix}-${index + 1}`,
        value: `sample-value-${index + 1}`,
        createdAt: new Date().toISOString(),
      }));
    };
    return [
      {
        sub: "abcd",
        timestamp: new Date().toISOString(),
        items: generateItems("event1"),
      },
      {
        sub: "abcdef",
        timestamp: new Date().toISOString(),
        items: generateItems("event2"),
      },
    ];
  } catch (error) {
    LOG.error("Error running extractor:", error);
    throw error;
  }
}