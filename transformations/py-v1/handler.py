from logstore import Logger


async def execute(event: dict, 
                  config: dict[str, str], 
                  vars: dict[str, str], 
                  log: Logger):
    """Implement your decision block here.

    Parameters
    -----------
    event : dict
        your event data as a dictionary.
    config : dict[str, str]
        the config values that you added during the creation of this decision block.
    vars : dict[str, str]
        any global variable assigned to the pipeline where this decision block is used.
    log : Logger
        a simple logger instance to capture any logs 

    """
    log.info("incoming config = {}", config)
    log.info("incoming vars = {}", vars)
    log.info("incoming event = {}", event)

    # Decision blocks must return only boolean values
    if len(event.get("sub")) % 2 == 0:
        return True
    return False