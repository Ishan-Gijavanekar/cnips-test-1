package handler

import (
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
)

func HandleRequest(c *fiber.Ctx) error {
	env := os.Environ()
	q := c.Queries()
	return c.Status(http.StatusOK).JSON(fiber.Map{"data": "hello", "env": env, "query": q})
}
