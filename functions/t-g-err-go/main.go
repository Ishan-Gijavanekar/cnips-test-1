package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/zinscky/log"
)

type WeatherResponse struct {
	Latitude             float64 `json:"latitude"`
	Longitude            float64 `json:"longitude"`
	GenerationTimeMs    float64 `json:"generationtime_ms"`
	UtcOffsetSeconds    int     `json:"utc_offset_seconds"`
	Timezone            string  `json:"timezone"`
	TimezoneAbbreviation string  `json:"timezone_abbreviation"`
	Elevation           float64 `json:"elevation"`
	CurrentWeather      struct {
		Temperature   float64 `json:"temperature"`
		Windspeed     float64 `json:"windspeed"`
		Winddirection float64 `json:"winddirection"`
		Weathercode   int     `json:"weathercode"`
		IsDay         int     `json:"is_day"`
		Time          string  `json:"time"`
	} `json:"current_weather"`
}

func HandleRequest(ctx *fiber.Ctx) error {
	LOG := log.NewLogger(ctx, log.Debug)
	LOG.Info("Request ID: %s", ctx.Get("X-Request-ID"))
	LOG.Info("Caller IP: %s", ctx.IP())

	// Generate UUID for response
	id := uuid.New().String()

	// Get query parameters
	latitude := ctx.Query("lat", "52.52")  // Default: Berlin
	longitude := ctx.Query("lon", "13.41") // Default: Berlin

	// Build Open-Meteo API URL
	apiUrl := fmt.Sprintf("https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current_weather=true", latitude, longitude)

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Make request to Open-Meteo API
	resp, err := client.Get(apiUrl)
	if err != nil {
		LOG.Error("Failed to fetch weather data: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch weather data",
			"details": err.Error(),
		})
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		LOG.Error("Failed to read response body: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read weather data",
			"details": err.Error(),
		})
	}

	// Parse JSON response
	var weatherData WeatherResponse
	if err := json.Unmarshal(body, &weatherData); err != nil {
		LOG.Error("Failed to parse weather data: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse weather data",
			"details": err.Error(),
		})
	}

	// Return weather data as JSON response
	return ctx.JSON(fiber.Map{
		"id":         id,
		"success":    true,
		"caller_ip":  ctx.IP(),
		"data":       weatherData,
		"source":     "Open-Meteo Weather API",
		"coordinates": fiber.Map{
			"latitude":  weatherData.Latitude,
			"longitude": weatherData.Longitude,
		},
		"current_weather": fiber.Map{
			"temperature":            weatherData.CurrentWeather.Temperature,
			"windspeed":              weatherData.CurrentWeather.Windspeed,
			"winddirection":          weatherData.CurrentWeather.Winddirection,
			"weathercode":            weatherData.CurrentWeather.Weathercode,
			"is_day":                 weatherData.CurrentWeather.IsDay,
			"time":                   weatherData.CurrentWeather.Time,
			"timezone":               weatherData.Timezone,
			"timezone_abbreviation": weatherData.TimezoneAbbreviation,
		},
	})
}