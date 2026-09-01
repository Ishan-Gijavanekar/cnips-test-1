from log import Logger


async def execute(event: dict, config: dict[str, str], vars: dict[str, str], logger: Logger):
    logger.info("incominf config = {}", config)
    logger.info("incominf vars = {}", vars)
    # print(f"incoming event {event}")
    event["subLength"] = len(event.get("sub"))
    return event, vars