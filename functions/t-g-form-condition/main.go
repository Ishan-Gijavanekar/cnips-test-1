package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/zinscky/log"
)

func HandleRequest(ctx *fiber.Ctx) error {
	LOG := log.NewLogger(ctx, log.Debug)
	LOG.Info("Request ID: %s", ctx.Get("X-Request-ID"))
	LOG.Info("Gibcen Request ID: %s", ctx.Get("X-Request-ID"))

	// Try to parse request body into a map
	var parsedBody map[string]interface{}
	var bodyResult interface{}

	if err := ctx.BodyParser(&parsedBody); err != nil {
		// fallback: just raw body as string
		bodyResult = string(ctx.Body())
		parsedBody = make(map[string]interface{}) // empty map for checks
	} else {
		bodyResult = parsedBody
	}

	// Check if email exists (body > query > params)
	email := ""
	if val, ok := parsedBody["email"]; ok {
		if str, ok := val.(string); ok {
			email = str
		}
	} else if q := ctx.Query("email"); q != "" {
		email = q
	} else if p := ctx.Params("email"); p != "" {
		email = p
	}
	if email == "gibcenkbaby@gmail.com" {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "user not allowed.",
		})
	}
	if email == "" {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "email not found",
		})
	}

	// collect request data
	data := fiber.Map{
		"requestId": ctx.Get("X-Request-ID"),
		"method":    ctx.Method(),
		"path":      ctx.Path(),
		"query":     ctx.Queries(),   // query parameters
		"params":    ctx.AllParams(), // route params
		"body":      bodyResult,      // parsed if possible, raw otherwise
		"headers":   ctx.GetReqHeaders(),
		"email":     email,
	}

	// send back as JSON
	return ctx.JSON(data)
}

