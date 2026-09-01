import { logger, levels } from "@cnips/log";

const LOG = logger(process.env.APP || "default", levels.info)

/**
 * Your expressjs handler function.
 * @param {Request} req 
 * @param {Response} res 
 * @returns 
 */
async function handleRequest(req, res) {
    try {
        // access defined config for this function from the request headers
        let client_id = req.headers["client_id"];
        if (!client_id) {
            LOG.error("Client ID is missing in the request headers");
            return res.status(400).json({ error: "Client ID is required" });
        }

        // Get location from request body or query params
        const location = req.body.location || req.query.location;
        if (!location) {
            LOG.error("Location is missing in the request");
            return res.status(400).json({ error: "Location is required" });
        }

        // Fetch weather data from OpenWeatherMap API
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            LOG.error("Weather API key is not configured");
            return res.status(500).json({ error: "Weather service unavailable" });
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
        
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            LOG.error(`Weather API error: ${weatherResponse.status} - ${weatherResponse.statusText}`);
            return res.status(400).json({ error: "Invalid location or weather service error" });
        }

        const weatherData = await weatherResponse.json();

        // Format the response
        const weatherInfo = {
            location: weatherData.name,
            country: weatherData.sys.country,
            temperature: weatherData.main.temp,
            feels_like: weatherData.main.feels_like,
            description: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            wind_speed: weatherData.wind.speed,
            timestamp: new Date().toISOString()
        };

        LOG.info(`Weather data retrieved for location: ${location}`);
        return res.json({ 
            success: true, 
            data: weatherInfo,
            message: "Weather data retrieved successfully" 
        });

    } catch (error) {
        LOG.error(`Error processing weather request: ${error.message}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}