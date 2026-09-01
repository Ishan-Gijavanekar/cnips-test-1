from logstore import Logger


async def execute(event: dict, 
                  config: dict[str, str], 
                  vars: dict[str, str], 
                  log: Logger):
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
    try:
        log.info("incoming config = {}", config)
        log.info("incoming vars = {}", vars)
        log.info("incoming event = {}", event)

        # your logic for data transformation
        event["charCount"] = len(event.get("sub"))
        # Always return the transformaed event, otherwise pipeline will stop processing

        log.info("{}", event)
        
        return event
    except Exception as e:
        log.error("exception in transformnation - {}", e)
        raise e