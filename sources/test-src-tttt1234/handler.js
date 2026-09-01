

/**
 * Extractor Function Contract:
 * 
 * @param config - Destination configuration (read-only)
 * @param vars - Global variables object (modify properties directly)
 * @param LOG - Logger instance for this execution
 * 
 * IMPORTANT: 
 * - DO NOT use require statement, always use import.
 * - Modify vars properties directly: vars.myProperty = newValue
 * - DO NOT reassign vars: vars = newObject (this won't work)
 * - Always return your extracted data as an array of objects.
 * - You can also use typescript if you want to enforce types
 * - Just add types to the function parameters and import Logger from "@cnips/simplelog"
 * 
 * Example:
 * ```typescript
 * import { Logger } from "@cnips/simplelog";
 * 
 * interface ExtractedData {
 *    sub: string;
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
 * export async function execute(config: Config, vars: Variables, LOG: Logger): Promise<ExtractedData[]>
 * ```
 */
export async function execute(config, vars, LOG) {
    try {
        /**
         * Example Logging Usage:
         */
        LOG.info(`Executing extractor`);
        LOG.debug(`Config: ${JSON.stringify(config)}`);
        LOG.debug(`Vars: ${JSON.stringify(vars)}`);
        /**
         * Or you can use printf style logging:
         */
        LOG.info("Config: %j, Vars: %j", config, vars);

        // Extractor logic goes here
        // For example, lets say you are pulling data from some api and returning it
        // let resp = await fetch(`${config.base_url}/data`, {
        //     method: 'GET',
        //     headers: { 'Authorization': `Bearer ${vars.access_token}` },
        // });
        // if (!resp.ok) {
        //     throw new Error(`Failed to fetch data: ${resp.statusText}`);
        // }
        // let data = await resp.json();
        // sample extracted data
        let extractedData = [
            { sub: "abcd", timestamp: new Date() },
            { sub: "abcdef", timestamp: new Date() }
        ];

        throw new Error("This is error", {});

        return extractedData
    } catch (error) {
        // Log and throw meaningful errors so that its easier for debugging
        LOG.error(`Error running extractor:`, error);
        throw error;
    }
}
