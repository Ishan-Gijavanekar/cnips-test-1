from logstore import Logger


async def execute(config: dict[str, str], logger: Logger):
    """Implement your extractor here.

    Parameters
    -----------
    config : dict[str, str]
        the config values that you added during the creation of this extractor.
    logger : Logger
        a simple logger instance to capture any logs 

    """
    try:
        logger.info("incoming config = {}", config)
        # your logic for data extraction

        data = [{"sub": "abc"}, {"sub": "abcd"}]
        #extracted data must always be returned as array
        return data
    except Exception as e:
        logger.error("exception in extraction - {}", e)
        raise e