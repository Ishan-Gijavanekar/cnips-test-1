from logstore import Logger


async def execute(event: dict, 
                  config: dict[str, str], 
                  vars: dict[str, str], 
                  log: Logger) -> tuple[dict, dict[str, str]]:
    """Implement your transformation here.

    Parameters
    -----------
    event : dict
        your event data as a dictionary.
    config : dict[str, str]
        the config values that you added during the creation of this transformation.
    vars : dict[str, str]
        any global variable assigned to the pipeline where this transformation is used.
    log : Logger
        a simple logger instance to capture any logs 

    """
    log.info("incoming config = {}", config)
    log.info("incoming vars = {}", vars)
    log.info("incoming event = {}", event)

    event["sub"] = event.get("sub").upper()
    # Always return the transformaed event and the global variable, otherwise pipeline will stop processing
    return event, vars