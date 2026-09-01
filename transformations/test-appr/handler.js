import sgMail from "@sendgrid/mail";
/**
 * Approval Script Function Contract:
 *
 * @param event - JSON object representing the event data
 * @param emailConfig - Email configuration object containing to, subject, and body
 * @param config - Configuration object
 * @param vars - Global variables object
 * @param LOG - Logger instance for this execution
 */
export async function execute(event, emailConfig, config, vars, LOG) {
    try {
        LOG.info(`Using SendGrid key prefix: ${config.sendgrid_api_key.slice(0, 10)}...`);
        sgMail.setApiKey(config.sendgrid_api_key);
    
        // Normalize "To" field to always be an array
        const toList = Array.isArray(emailConfig.to)
          ? emailConfig.to
          : [emailConfig.to];
    
        const msg = {
          to: toList,
          from: config.email_from,
          subject: emailConfig.subject,
          html: emailConfig.body,
        };

        LOG.info(`Msg: ${JSON.stringify(msg)}`)
    
        const response = await sgMail.send(msg);
        LOG.info(
          `Email sent successfully to ${toList.join(", ")} — ${JSON.stringify(
            response
          )}`
        );
    
        return { status: "success", recipients: toList };
      } catch (err) {
        LOG.error(`Error sending email : ${err.message}`);
        throw err;
      }
}