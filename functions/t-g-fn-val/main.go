package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/zinscky/log"
)

func HandleRequest(ctx *fiber.Ctx) error {
	LOG := log.NewLogger(ctx, log.Debug)
	LOG.Info("Request ID: %s", ctx.Get("X-Request-ID"))
	return ctx.SendString("Hello, World! by Gibcen")
}
