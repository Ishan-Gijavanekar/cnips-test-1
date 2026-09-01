from logstore import Logger


async def execute(event: dict, 
                  config: dict[str, str], 
                  vars: dict[str, str], 
                  log: Logger) -> str:
    try:
        log.info("incoming config = {}", config)
        log.info("incoming vars = {}", vars)
        log.info("incoming event = {}", event)

       # printf-style logging
        log.info("Event details: {}, Config: {}, Vars: {}", event, config, vars)

        # Example switch logic:
        category = event.get("category")

        if category == "1":
            log.info("d1")
            return "d1"

        elif category == "2":
            log.info("d2")
            return "d2"

        else:
            return "d5"

    except Exception as e:
        log.error("Error executing switch - {}", e)
        raise e