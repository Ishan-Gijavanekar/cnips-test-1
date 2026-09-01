from logstore import Logger


async def execute(event: dict, 
                  config: dict[str, str], 
                  vars: dict[str, str], 
                  log: Logger):
    """Implement your destination here.

    Parameters
    -----------
    event : dict
        your event data as a dictionary.
    config : dict[str, str]
        the config values that you added during the creation of this destination.
    vars : dict[str, str]
        any global variable assigned to the pipeline wheree this destination is used.
    log : Logger
        a simple logger instance to capture any logs 

    """
    try:
        log.info("incoming config = {}", config)
        log.info("incoming vars = {}", vars)

        #send to destination
        log.info("incoming event = {}", event)
    except Exception as e:
        log.error("exception in destination - {}", e)
        raise e