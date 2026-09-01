from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from logstore import Logger


async def execute(event: dict, email_config: dict, config: dict[str, str], vars: dict[str, str], log: Logger):
    """
    Approval Script Function Contract (Python Version)

    Parameters
    ----------
    event : dict
        Event data as a dictionary.
    email_config : dict
        Email configuration containing 'to', 'subject', and 'body'.
    config : dict[str, str]
        Configuration object with 'sendgrid_api_key' and 'email_from'.
    vars : dict[str, str]
        Global variables object (can be modified directly).
    log : Logger
        Logger instance for this execution.
    """
    try:
        api_key = config.get("sendgrid_api_key")
        email_from = config.get("email_from")

        if not api_key or not email_from:
            raise ValueError("sendgrid_api_key and email_from must be provided in config")

        to_list = email_config.get("to")
        if isinstance(to_list, str):
            to_list = [to_list]

        if not to_list:
            raise ValueError("At least one recipient (To) must be provided in email_config")

        sg = SendGridAPIClient(api_key)

        message = Mail(
            from_email=email_from,
            to_emails=to_list,
            subject=email_config.get("subject", ""),
            html_content=email_config.get("body", ""),
        )

        response = sg.send(message)

        log.info("Email sent successfully to {} — Status: {}, Body: {}".format(
            ", ".join(to_list), response.status_code, response.body.decode() if response.body else "No body"
        ))

        return {"status": "success", "recipients": to_list}

    except Exception as e:
        log.error
