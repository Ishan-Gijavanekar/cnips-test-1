package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/zinscky/log"
)

func HandleRequest(ctx *fiber.Ctx) error {
	LOG := log.NewLogger(ctx, log.Debug)
	LOG.Info("Request ID: %s", ctx.Get("X-Request-ID"))
	LOG.Info("Query params: %v", ctx.Queries())
	body := string(ctx.Body())
	LOG.Info("Request Body: %s", body)
	return ctx.SendString(body)
}
