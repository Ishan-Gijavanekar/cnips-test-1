package handler

import (
	"context"
	"encoding/json"

	"github.com/innacy/table"
	"github.com/zinscky/log"
)

type Row struct {
	Name       string `json:"name,omitempty"`
	Department string `json:"department,omitempty"`
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside transformation")

	tableAccessor := table.NewCnipsTableAccessor[Row](config["table_base_url"], config["apiKey"])

	tableId := config["tableId"]
	ctx := context.Background()

	log.Info("=== CNIPS Table Accessor Examples ===")

	// Example 1: Insert a single row
	exampleInsert(ctx, tableAccessor, tableId, log)

	// Example 2: Bulk insert multiple rows
	exampleBulkInsert(ctx, tableAccessor, tableId, log)

	// Example 3: Find rows with query
	exampleFind(ctx, tableAccessor, tableId, log)

	// Example 4: Update rows
	exampleUpdate(ctx, tableAccessor, tableId, log)

	// Example 5: Delete rows
	exampleDelete(ctx, tableAccessor, tableId, log)

	result := map[string]string{
		"message": "task completed",
	}
	marshalResult, _ := json.Marshal(&result)
	return string(marshalResult), nil
}

// exampleInsert demonstrates inserting a single record
func exampleInsert(ctx context.Context, tableAccessor *table.CnipsTableAccessor[Row], tableId string, log *log.Logger) {
	log.Info("1. Insert Single Row")
	log.Info("-------------------")

	row := &Row{
		Name:       "John Doe",
		Department: "IT",
	}

	err := tableAccessor.Insert(ctx, tableId, row)
	if err != nil {
		log.Error("Error inserting row: %v", err)
		return
	}
	log.Info("✓ Successfully inserted: %+v", row)
}

// exampleBulkInsert demonstrates inserting multiple records at once
func exampleBulkInsert(ctx context.Context, tableAccessor *table.CnipsTableAccessor[Row], tableId string, log *log.Logger) {
	log.Info("2. Bulk Insert Multiple Rows")
	log.Info("----------------------------")

	rows := []Row{
		{Name: "Jane Doe", Department: "HR"},
		{Name: "Jim Beam", Department: "Sales"},
		{Name: "Alice Smith", Department: "IT"},
		{Name: "Bob Johnson", Department: "Marketing"},
	}

	err := tableAccessor.BulkInsert(ctx, tableId, rows)
	if err != nil {
		log.Error("Error bulk inserting rows: %v", err)
		return
	}
	log.Info("✓ Successfully bulk inserted %d rows", len(rows))
}

// exampleFind demonstrates querying records with different query patterns
func exampleFind(ctx context.Context, tableAccessor *table.CnipsTableAccessor[Row], tableId string, log *log.Logger) {
	log.Info("3. Find Rows with Query")
	log.Info("------------------------")

	// Find all rows (empty query)
	log.Info("Finding all rows...")
	allRows, err := tableAccessor.Find(ctx, tableId, nil)
	if err != nil {
		log.Error("Error finding rows: %v", err)
	} else {
		log.Info("✓ Found %d rows", len(allRows))
		for i, row := range allRows {
			log.Info("  [%d] %+v", i+1, row)
		}
	}

	// Find rows with specific department
	log.Info("Finding rows in IT department...")
	query := map[string]any{
		"department": "IT",
	}
	itRows, err := tableAccessor.Find(ctx, tableId, query)
	if err != nil {
		log.Error("Error finding rows: %v", err)
	} else {
		log.Info("✓ Found %d IT employees", len(itRows))
		for i, row := range itRows {
			log.Info("  [%d] %+v", i+1, row)
		}
	}
}

// exampleUpdate demonstrates updating records
func exampleUpdate(ctx context.Context, tableAccessor *table.CnipsTableAccessor[Row], tableId string, log *log.Logger) {
	log.Info("4. Update Rows")
	log.Info("--------------")

	// Update all IT department employees
	query := map[string]any{
		"department": "IT",
	}
	updateData := &Row{
		Department: "Engineering", // Update department name
	}

	updatedRows, err := tableAccessor.Update(ctx, tableId, query, updateData)
	if err != nil {
		log.Error("Error updating rows: %v", err)
		return
	}
	log.Info("✓ Successfully updated %d rows", len(updatedRows))
	for i, row := range updatedRows {
		log.Info("  [%d] %+v", i+1, row.Department)
		log.Info("  [%d] %+v", i+1, row.Name)
	}
}

// exampleDelete demonstrates deleting records
func exampleDelete(ctx context.Context, tableAccessor *table.CnipsTableAccessor[Row], tableId string, log *log.Logger) {
	log.Info("5. Delete Rows")
	log.Info("---------------")

	// Delete rows matching a specific condition
	query := map[string]any{
		"department": "Marketing",
	}

	err := tableAccessor.Delete(ctx, tableId, query)
	if err != nil {
		log.Error("Error deleting rows: %v", err)
		return
	}
	log.Info("✓ Successfully deleted rows matching query: %v", query)
}