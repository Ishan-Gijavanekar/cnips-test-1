
from log import Logger


async def execute(event: dict, config: dict[str, str], vars: dict[str, str], logger: Logger):
    logger.info("incoming event = ", event)
    return event, vars
