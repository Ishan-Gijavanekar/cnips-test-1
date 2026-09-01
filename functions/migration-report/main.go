package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/innacy/table"
	"github.com/zinscky/log"
)

type MigrationReport struct {
	RunID         string `json:"run_id"`
	EntityType    string `json:"entity_type"`
	TenantID      string `json:"tenant_id"`
	DryRun        bool   `json:"dry_run"`
	StartedAt     string `json:"started_at"`
	CompletedAt   string `json:"completed_at"`
	DurationMs    int    `json:"duration_ms"`
	TotalRecords  int    `json:"total_records"`
	SuccessCount  int    `json:"success_count"`
	WarningCount  int    `json:"warning_count"`
	CriticalCount int    `json:"critical_count"`
}

func HandleRequest(ctx *fiber.Ctx) error {
	logger := log.NewLogger(ctx, log.Debug)

	var row MigrationReport
	if err := ctx.BodyParser(&row); err != nil {
		logger.Error("invalid request: %v", err)
		return ctx.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	tableAccessor := table.NewCnipsTableAccessor[MigrationReport](
		ctx.Get("table_base_url"),
		ctx.Get("apiKey"),
	)

	tableId := ctx.Get("tableId")
	c := context.Background()

	err := tableAccessor.Insert(c, tableId, &row)
	if err != nil {
		logger.Error("Error inserting row: %v", err)
		return ctx.Status(500).JSON(fiber.Map{"error": "insert failed"})
	}

	logger.Info("Successfully inserted: %s", row.RunID)

	result := "clean"
	if row.CriticalCount > 0 {
		result = "critical"
	} else if row.WarningCount > 0 {
		result = "warning"
	}

	notification := map[string]string{}
	b := strings.Builder{}
	b.WriteString("Migration Report\n")
	b.WriteString("================\n")
	b.WriteString("Run ID: " + row.RunID + "\n")
	b.WriteString("Entity Type: " + row.EntityType + "\n")
	b.WriteString("Tenant ID: " + row.TenantID + "\n")
	b.WriteString("Dry Run: " + strconv.FormatBool(row.DryRun) + "\n")
	b.WriteString("Started At: " + row.StartedAt + "\n")
	b.WriteString("Completed At: " + row.CompletedAt + "\n")
	b.WriteString("Duration (ms): " + strconv.Itoa(row.DurationMs) + "\n")
	b.WriteString("\nSummary:\n")
	b.WriteString("Total Records: " + strconv.Itoa(row.TotalRecords) + "\n")
	b.WriteString("Successful Migrations: " + strconv.Itoa(row.SuccessCount) + "\n")
	b.WriteString("Warnings: " + strconv.Itoa(row.WarningCount) + "\n")
	b.WriteString("Critical Issues: " + strconv.Itoa(row.CriticalCount) + "\n")
	notification["text"] = b.String()

	if result == "critical" || result == "warning" {
		go func() {
			url := ctx.Get("notification_url")

			body, err := json.Marshal(notification)
			if err != nil {
				logger.Error("notification marshal failed: %v", err)
			}

			_, err = http.Post(url, "application/json", bytes.NewBuffer(body))
			if err != nil {
				logger.Error("notification failed: %v", err)
			} else {
				logger.Info("notification sent for run_id: %s", row.RunID)
			}
		}()
	}

	return ctx.Status(200).JSON(fiber.Map{
		"status": "success",
	})
}
