/**
 * Destination Function Contract:
 * 
 * @param event - JSON object representing the event data
 * @param config - Destination configuration (read-only)
 * @param vars - Global variables object (modify properties directly)
 * @param LOG - Logger instance for this execution
 * 
 * IMPORTANT: 
 * - DO NOT use require statement, always use import.
 * - Modify vars properties directly: vars.myProperty = newValue
 * - DO NOT reassign vars: vars = newObject (this won't work)
 * - No return values are required as this script is used to send data to destinations.
 * - You can also use typescript if you want to enforce types
 * - Just add types to the function parameters and import Logger from "@cnips/simplelog"
 * 
 * Example:
 * ```typescript
 * import { Logger } from "@cnips/simplelog";
 * 
 * interface MyEvent {
 *    type: string;
 *    timestamp: Date;
 * }
 * 
 * interface Config {
 *   base_url: string;
 *   api_key: string;
 * }
 * 
 * interface Veriables {
 *  access_token: string;
 * }
 * 
 * export async function execute(event: MyEvent, config: Config, vars: Variables, LOG: Logger)
 * ```
 */
export async function execute(event, config, vars, LOG) {
    try {
        /**
         * Example Logging Usage:
         */
        LOG.info(`Executing event: ${event}`);
        LOG.debug(`Config: ${JSON.stringify(config)}`);
        LOG.debug(`Vars: ${JSON.stringify(vars)}`);
        /**
         * Or you can use printf style logging:
         */
        LOG.info(`Event details: %s, Config: %j, Vars: %j`, event, config, vars);

        // Destination logic goes here
        // For example, you might send the event to an external API
        // const response = await fetch(`${config.base_url}/events`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${vars.access_token}`
        //     },
        //     body: JSON.stringify(event)
        // });

        // if (!response.ok) {
        //     throw new Error(`Failed to send event: ${response.statusText}`);
        // }
        const result = factorial(event.number);
        LOG.info(`Result of factorial calculation: ${result}`);

        LOG.info(`Event sent successfully: ${event}`);
    } catch (error) {
        // Log and throw meaningful errors so that its easier for debugging
        LOG.error(`Error executing event ${event}:`, error);
        throw error;
    }
}

function factorial (num) {
    if (num < 0) return undefined; // Factorial is not defined for negative numbers
    if (num === 0 || num === 1) return 1; // Factorial of 0 and 1 is 1
    let result = 1;
    for (let i = 2; i <= num; i++) {
        result *= i;
    }
    return result;
}