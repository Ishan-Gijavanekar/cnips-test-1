from log import Logger


async def execute(event: dict, config: dict[str, str], vars: dict[str, str], logger: Logger):
    logger.info("incoming config = {}", config)
    logger.info("incoming vars = {}", vars)
    logger.info("incoming event = {}", event)
    # print(f"incoming event {event}")
    # event["charCount"] = len(event["sub"])
    return event, vars