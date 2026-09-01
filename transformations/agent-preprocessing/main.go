package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"
	"unicode"

	"github.com/zinscky/log"
)

// GitLab webhook payload structures

type WebhookPayload struct {
	ObjectKind       string           `json:"object_kind"`
	User             User             `json:"user"`
	ObjectAttributes ObjectAttributes `json:"object_attributes"`
	Project          Project          `json:"project"`
}

type User struct {
	Username string `json:"username"`
}

type ObjectAttributes struct {
	IID         int    `json:"iid"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Action      string `json:"action"`
	AuthorID    int    `json:"author_id"`
}

type Project struct {
	ID int `json:"id"`
}

// ExecuteOutput is the JSON structure returned by Execute.
type ExecuteOutput struct {
	ProjectID  int    `json:"project_id"`
	IssueIID   int    `json:"issue_iid"`
	AuthorID   int    `json:"author_id"`
	AuthorName string `json:"author_name"`
	Title      string `json:"title"`
	Prompt     string `json:"prompt"`
}

// Search types

type DocsIndex struct {
	Sections []Section
	DF       map[string]int
}

type Section struct {
	Text       string
	TF         map[string]int
	TokenCount int
}

type SearchResult struct {
	Text  string
	Score float64
}

const docsURL = "https://dev-docs.cnips.eu/llms-full.txt"

var (
	docsIndex *DocsIndex
	docsOnce  sync.Once
	docsErr   error
)

// Config keys:
//   GITLAB_BOT_USERNAME  - bot username for loop prevention
//   GITLAB_PROJECT_ID    - (optional) only process events from this project

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("processing gitlab webhook event")

	var payload WebhookPayload
	if err := json.Unmarshal([]byte(event), &payload); err != nil {
		log.Error("failed to parse webhook payload: " + err.Error())
		return "", fmt.Errorf("invalid webhook payload: %w", err)
	}

	if payload.ObjectKind != "issue" {
		log.Info("ignoring event kind: " + payload.ObjectKind)
		return "", fmt.Errorf("ignored: event kind is %q, not an issue", payload.ObjectKind)
	}

	if payload.ObjectAttributes.Action != "open" {
		log.Info("ignoring issue action: " + payload.ObjectAttributes.Action)
		return "", fmt.Errorf("ignored: issue action is %q, not open", payload.ObjectAttributes.Action)
	}

	if pid, ok := config["GITLAB_PROJECT_ID"]; ok && pid != "" {
		expectedID, err := strconv.Atoi(pid)
		if err != nil {
			log.Error("invalid GITLAB_PROJECT_ID in config: " + pid)
			return "", fmt.Errorf("invalid GITLAB_PROJECT_ID: %w", err)
		}
		if payload.Project.ID != expectedID {
			log.Info(fmt.Sprintf("ignoring issue from project %d (expected %d)", payload.Project.ID, expectedID))
			return "", fmt.Errorf("ignored: project ID %d does not match expected %d", payload.Project.ID, expectedID)
		}
	}

	botUsername := config["GITLAB_BOT_USERNAME"]
	if botUsername != "" && payload.User.Username == botUsername {
		log.Info("ignoring issue created by bot user: " + botUsername)
		return "", fmt.Errorf("ignored: issue created by bot user %q", botUsername)
	}

	log.Info(fmt.Sprintf("processing issue #%d: %s", payload.ObjectAttributes.IID, payload.ObjectAttributes.Title))

	docsOnce.Do(func() {
		log.Info("downloading docs from " + docsURL)
		docsIndex, docsErr = fetchAndIndexDocs(docsURL)
		if docsErr == nil {
			log.Info(fmt.Sprintf("loaded docs: %d sections indexed", len(docsIndex.Sections)))
		}
	})
	if docsErr != nil {
		log.Error("failed to load docs: " + docsErr.Error())
		return "", fmt.Errorf("failed to load docs: %w", docsErr)
	}

	query := payload.ObjectAttributes.Title
	if payload.ObjectAttributes.Description != "" {
		query += "\n" + payload.ObjectAttributes.Description
	}

	results := docsIndex.Search(query, 5)
	var docsContext strings.Builder
	for i, r := range results {
		docsContext.WriteString(fmt.Sprintf("--- Relevant Section %d (score: %.2f) ---\n%s\n\n", i+1, r.Score, r.Text))
	}
	if docsContext.Len() == 0 {
		docsContext.WriteString("(No relevant documentation found)")
	}

	log.Info(fmt.Sprintf("found %d relevant doc sections for issue #%d", len(results), payload.ObjectAttributes.IID))

	prompt := fmt.Sprintf(`You are a friendly and knowledgeable customer service agent for cnips, an Integration Platform as a
  Service (iPaaS).
  Your role is to help users who create issues on our GitLab project by providing helpful, accurate responses based on our
  documentation.

  Guidelines:
  - Be professional, friendly, and concise
  - Base your answers on the provided documentation context
  - If the documentation doesn't cover the question, say so honestly and suggest they contact support
  - If the issue is a bug report, acknowledge it and provide any relevant troubleshooting steps from the docs
  - If the issue is a feature request, acknowledge it positively
  - Do not make up information that isn't in the documentation

  You MUST respond with ONLY a valid JSON object in the following exact format, no markdown fences, no extra text:

  {
    "project_id": %d,
    "issue_iid": %d,
    "author_id": %d,
    "author_name": "%s",
    "title": "%s",
    "response": "<your helpful response in Markdown here>"
  }

  A user has created the following issue:

  %s

  Here is relevant documentation that may help answer their question:

  %s

  Remember: respond ONLY with the JSON object above, filling in the "response" field with your helpful answer.`,
		payload.Project.ID,
		payload.ObjectAttributes.IID,
		payload.ObjectAttributes.AuthorID,
		payload.User.Username,
		payload.ObjectAttributes.Title,
		query,
		docsContext.String())

	output := ExecuteOutput{
		ProjectID:  payload.Project.ID,
		IssueIID:   payload.ObjectAttributes.IID,
		AuthorID:   payload.ObjectAttributes.AuthorID,
		AuthorName: payload.User.Username,
		Title:      payload.ObjectAttributes.Title,
		Prompt:     prompt,
	}

	out, err := json.Marshal(output)
	if err != nil {
		log.Error("failed to marshal output: " + err.Error())
		return "", fmt.Errorf("marshal output: %w", err)
	}

	return string(out), nil
}

// --- Docs fetching and search ---

func fetchAndIndexDocs(url string) (*DocsIndex, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("download docs: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("download docs: status %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read docs body: %w", err)
	}

	sections := splitSections(string(data))
	idx := &DocsIndex{DF: make(map[string]int)}

	for _, text := range sections {
		text = strings.TrimSpace(text)
		if len(text) < 20 {
			continue
		}

		tokens := tokenize(text)
		tf := make(map[string]int)
		for _, t := range tokens {
			tf[t]++
		}

		idx.Sections = append(idx.Sections, Section{Text: text, TF: tf, TokenCount: len(tokens)})

		seen := make(map[string]bool)
		for _, t := range tokens {
			if !seen[t] {
				idx.DF[t]++
				seen[t] = true
			}
		}
	}

	return idx, nil
}

func splitSections(content string) []string {
	var sections []string
	lines := strings.Split(content, "\n")
	var current []string

	for _, line := range lines {
		if strings.HasPrefix(line, "## ") || strings.HasPrefix(line, "# ") {
			if len(current) > 0 {
				sections = append(sections, strings.Join(current, "\n"))
			}
			current = []string{line}
			continue
		}

		if strings.TrimSpace(line) == "" && len(current) > 0 {
			last := strings.TrimSpace(current[len(current)-1])
			if last == "" {
				text := strings.Join(current, "\n")
				if strings.TrimSpace(text) != "" {
					sections = append(sections, text)
				}
				current = nil
				continue
			}
		}

		current = append(current, line)
	}

	if len(current) > 0 {
		text := strings.Join(current, "\n")
		if strings.TrimSpace(text) != "" {
			sections = append(sections, text)
		}
	}

	return sections
}

func tokenize(text string) []string {
	text = strings.ToLower(text)
	var tokens []string
	var current []rune

	for _, r := range text {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			current = append(current, r)
		} else if len(current) > 0 {
			word := string(current)
			if !stopWords[word] && len(word) > 1 {
				tokens = append(tokens, word)
			}
			current = current[:0]
		}
	}
	if len(current) > 0 {
		word := string(current)
		if !stopWords[word] && len(word) > 1 {
			tokens = append(tokens, word)
		}
	}

	return tokens
}

func (idx *DocsIndex) Search(query string, topN int) []SearchResult {
	queryTokens := tokenize(query)
	if len(queryTokens) == 0 {
		return nil
	}

	n := float64(len(idx.Sections))
	var totalLen float64
	for _, s := range idx.Sections {
		totalLen += float64(s.TokenCount)
	}
	avgDL := totalLen / n
	k1, b := 1.5, 0.75

	type scored struct {
		index int
		score float64
	}
	var results []scored

	for i, sec := range idx.Sections {
		score := 0.0
		dl := float64(sec.TokenCount)
		for _, term := range queryTokens {
			tf := float64(sec.TF[term])
			if tf == 0 {
				continue
			}
			df := float64(idx.DF[term])
			idf := math.Log((n - df + 0.5) / (df + 0.5))
			if idf < 0 {
				idf = 0
			}
			score += idf * (tf * (k1 + 1)) / (tf + k1*(1-b+b*(dl/avgDL)))
		}
		if score > 0 {
			results = append(results, scored{index: i, score: score})
		}
	}

	sort.Slice(results, func(i, j int) bool { return results[i].score > results[j].score })
	if len(results) > topN {
		results = results[:topN]
	}

	var out []SearchResult
	for _, r := range results {
		text := idx.Sections[r.index].Text
		if len(text) > 2000 {
			text = text[:2000] + "..."
		}
		out = append(out, SearchResult{Text: text, Score: r.score})
	}
	return out
}

var stopWords = map[string]bool{
	"the": true, "is": true, "at": true, "which": true, "on": true,
	"a": true, "an": true, "and": true, "or": true, "but": true,
	"in": true, "with": true, "to": true, "for": true, "of": true,
	"not": true, "no": true, "can": true, "had": true, "has": true,
	"have": true, "it": true, "its": true, "was": true, "were": true,
	"will": true, "be": true, "been": true, "being": true, "do": true,
	"does": true, "did": true, "this": true, "that": true, "these": true,
	"those": true, "am": true, "are": true, "if": true, "then": true,
	"so": true, "than": true, "too": true, "very": true, "just": true,
	"about": true, "above": true, "after": true, "again": true, "all": true,
	"also": true, "any": true, "because": true, "before": true, "between": true,
	"both": true, "by": true, "could": true, "each": true, "from": true,
	"get": true, "got": true, "he": true, "her": true, "here": true,
	"him": true, "his": true, "how": true, "into": true, "me": true,
	"more": true, "my": true, "our": true, "out": true, "over": true,
	"she": true, "should": true, "some": true, "such": true, "them": true,
	"there": true, "they": true, "through": true, "under": true, "up": true,
	"us": true, "we": true, "what": true, "when": true, "where": true,
	"who": true, "whom": true, "why": true, "would": true, "you": true,
	"your": true,
}
