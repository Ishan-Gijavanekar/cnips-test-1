package handler

import (
	"encoding/json"
	"fmt"
	"sync"
	"net/http"
	"net/url"
	"io"

	"github.com/zinscky/log"
)

type MyEvent struct {
	ServiceNames       []string `json:"serviceNames"`
	ProjectIds 		   []int	 `json:"projectIds"`
}

func getDistinctProjectIDs(group string, projectNames []string, gitlabBaseURL,gitlabToken string) ([]int, error) {
	var (
		mu    sync.Mutex
		wg    sync.WaitGroup
		idSet = make(map[int]struct{})
		errs  = make(chan error, len(projectNames))
	)

	client := &http.Client{}

	for _, name := range projectNames {
		wg.Add(1)

		go func(projectName string) {
			defer wg.Done()

			var apiURL string
			if group != "" {
				fullPath := fmt.Sprintf("%s/%s", group, projectName)
				apiURL = fmt.Sprintf("%s/projects/%s", gitlabBaseURL, url.PathEscape(fullPath))
			} else {
				apiURL = fmt.Sprintf("%s/projects?search=%s", gitlabBaseURL, url.QueryEscape(projectName))
			}

			req, err := http.NewRequest("GET", apiURL, nil)
			if err != nil {
				errs <- fmt.Errorf("error creating request for '%s': %w", projectName, err)
				return
			}
			req.Header.Set("PRIVATE-TOKEN", gitlabToken)

			resp, err := client.Do(req)
			if err != nil {
				errs <- fmt.Errorf("error fetching '%s': %w", projectName, err)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				body, _ := io.ReadAll(resp.Body)
				errs <- fmt.Errorf("failed for '%s': %s", projectName, string(body))
				return
			}

			if group != "" {
				var project struct {
					ID int `json:"id"`
				}
				if err := json.NewDecoder(resp.Body).Decode(&project); err != nil {
					errs <- fmt.Errorf("decoding failed for '%s': %w", projectName, err)
					return
				}

				mu.Lock()
				idSet[project.ID] = struct{}{}
				mu.Unlock()
			} else {
				var projects []struct {
					ID   int    `json:"id"`
					Name string `json:"name"`
					Path string `json:"path"`
				}
				if err := json.NewDecoder(resp.Body).Decode(&projects); err != nil {
					errs <- fmt.Errorf("decoding failed for '%s': %w", projectName, err)
					return
				}

				if len(projects) == 0 {
					errs <- fmt.Errorf("no project found for '%s'", projectName)
					return
				}
				mu.Lock()
				idSet[projects[0].ID] = struct{}{}
				mu.Unlock()
			}
		}(name)
	}

	wg.Wait()
	close(errs)

	if len(errs) > 0 {
		return nil, <-errs
	}

	uniqueIDs := make([]int, 0, len(idSet))
	for id := range idSet {
		uniqueIDs = append(uniqueIDs, id)
	}

	return uniqueIDs, nil
}

func Execute(event string, config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("inside transformation")
	// unmarshal incoming event to your struct
	myEvent := &MyEvent{}
	err := json.Unmarshal([]byte(event), myEvent)
	if err != nil {
		return "", err
	}
	// apply your transformation logic
	var group string 
	group = config["group"]
	gBaseURL:= config["gitlabBaseURL"]
	gToken := config["gitlabToken"]
	projectIds, error := getDistinctProjectIDs(group,myEvent.ServiceNames,gBaseURL,gToken)

	if error != nil {
		return "", error
	}
	myEvent.ProjectIds = projectIds
	// marshal your event back to json
	transformedEvent, err := json.Marshal(myEvent)
	if err != nil {
		return "", err
	}
	return string(transformedEvent), nil
}
