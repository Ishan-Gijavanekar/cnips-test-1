from logstore import Logger


async def execute(event: dict, 
                  config: dict[str, str], 
                  vars: dict[str, str], 
                  log: Logger) -> str:
    """
    Switch Component Function Contract

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

    Returns
    -------
    str
        One of the switch labels you defined in the pipeline UI.

    Notes
    -----
    - Always RETURN a string label.
    - Do NOT return objects or data — switch only accepts labels.
    - Returning undefined label will stop pipeline processing.
    """
    try:
        log.info("incoming config = {}", config)
        log.info("incoming vars = {}", vars)
        log.info("incoming event = {}", event)

       # printf-style logging
        log.info("Event details: {}, Config: {}, Vars: {}", event, config, vars)

        # Example switch logic:
        category = event.get("category")

        if category == "user_added":
            return "user_added_label"

        elif category == "user_deleted":
            return "user_deleted_label"

        else:
            return "default_label"

    except Exception as e:
        log.error("Error executing switch - {}", e)
        raise e