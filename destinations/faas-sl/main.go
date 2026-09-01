package main

import (
	"github.com/gofiber/fiber/v2"
)

func Handle(ctx *fiber.Ctx) ( error) {/* required */
	return ctx.Send([]byte("hello world"))
}
