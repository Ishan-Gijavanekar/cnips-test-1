/**
 * Decision Function Contract:
 * 
 * @param event - JSON object representing the event data
 * @param config - Decision configuration (read-only)
 * @param vars - Global variables object (modify properties directly)
 * @param LOG - Logger instance for this execution
 * 
 * IMPORTANT: 
 * - DO NOT use require statement, always use import.
 * - Modify vars properties directly: vars.myProperty = newValue
 * - DO NOT reassign vars: vars = newObject (this won't work)
 * - Return boolean for decision response
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
 * export function execute(event: MyEvent, vars: Variables): Promise<boolean>
 * ```
 */
export async function execute(event, config, vars, LOG) {
    try {
        /**
         * Exxample Logging Usage:
         */
        LOG.info(`Executing event: ${event}`);
        LOG.debug(`Config: ${JSON.stringify(config)}`);
        LOG.debug(`Vars: ${JSON.stringify(vars)}`);
        /**
         * Or you can use printf style logging:
         */
        LOG.info(`Event details: %s, Config: %j, Vars: %j`, event, config, vars);

        // Decision logic goes here
        if (!event) {
            return false
        }
        return true;
    } catch (error) {
        // Log and throw meaningful errors so that its easier for debugging
        LOG.error(`Error executing event ${event}:`, error);
        throw error;
    }
}