package handler

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/innacy/table"
	"github.com/zinscky/log"
)

type MigrationErrorRequest struct {
	MigrationRunID string `json:"migration_run_id" bson:"migration_run_id"`
	RecordID       string `json:"record_id" bson:"record_id"`
	Outcome        string `json:"outcome" bson:"outcome"`
	Warning        string `json:"warning,omitempty" bson:"warning,omitempty"`
	CriticalError  string `json:"critical_error,omitempty" bson:"critical_error,omitempty"`
	FailedSnapshot string `json:"failed_snapshot,omitempty" bson:"failed_snapshot,omitempty"`
	DurationMs     int64  `json:"duration_ms" bson:"duration_ms"`
}

func HandleRequest(ctx *fiber.Ctx) error {
	logger := log.NewLogger(ctx, log.Debug)

	var req MigrationErrorRequest
	if err := ctx.BodyParser(&req); err != nil {
		logger.Error("invalid request: %v", err)
		return ctx.Status(400).JSON(fiber.Map{
			"error": "invalid request payload",
		})
	}

	if req.Outcome != "warning" && req.Outcome != "critical" {
	return ctx.Status(200).JSON(fiber.Map{
    "status":  "success",
    "message": "no action taken due to invalid outcome",
})
	}

	if req.MigrationRunID == "" || req.RecordID == "" {
		logger.Error("missing required fields")
		return ctx.Status(200).JSON(fiber.Map{
    "status":  "success",
    "message": "migration_run_id and record_id are required",
})
	}
	tableBaseURL := ctx.Get("table_base_url")
	tableApiKey := ctx.Get("migration_error_key")
	tableAccessor := table.NewCnipsTableAccessor[MigrationErrorRequest](
		tableBaseURL,
		tableApiKey,
	)
	logger.Info("table initialized with baseurl %s and apikey %s", tableBaseURL, tableApiKey)
	tableID := ctx.Get("tableId")
	c := context.Background()

	err := tableAccessor.Insert(c, tableID, &req)
	if err != nil {
		logger.Error("Error inserting row: %v", err)
		return ctx.Status(500).JSON(fiber.Map{
			"error": "failed to insert migration error",
		})
	}

	logger.Info("Successfully inserted: %s", req.RecordID)

	return ctx.Status(200).JSON(fiber.Map{
		"status":    "success",
		"record_id": req.RecordID,
	})
}
