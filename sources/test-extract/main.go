package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"sync"
	"time"

	"github.com/zinscky/log"
	gitlab "gitlab.com/gitlab-org/api/client-go"
)

type MyEvent struct {
	GitlabBaseUrl      string         `json:"gitlabBaseUrl"`
	GitlabToken        string         `json:"gitlabToken"`
	Groups             []gitlab.Group `json:"groups"`
	ReportDurationDays int            `json:"reportDurationDays"`
	ReportGroupId      string         `json:"reportGroupId"`
}

type gitLabClient struct {
	client *gitlab.Client
}

type GitLabClient interface {
	ListGroups(ctx context.Context, log *log.Logger) ([]*gitlab.Group, error)
}

func NewGitLabClient(token, baseurl string) (GitLabClient, error) {
	client, err := gitlab.NewClient(token, gitlab.WithBaseURL(baseurl))
	if err != nil {
		return nil, fmt.Errorf("failed to create GitLab client: %w", err)
	}
	return &gitLabClient{client: client}, nil
}

func (c *gitLabClient) ListGroups(ctx context.Context, log *log.Logger) ([]*gitlab.Group, error) {
	var (
		allGroups []*gitlab.Group
		mu        sync.Mutex
		wg        sync.WaitGroup
		errCh     = make(chan error, 1)
	)
	

	groupsCh := make(chan []*gitlab.Group)
	go func() {
		defer close(groupsCh)
		opts := &gitlab.ListGroupsOptions{
			ListOptions: gitlab.ListOptions{PerPage: 100, Page: 1},
		}

		for {
			select {
			case <-ctx.Done():
				return
			default:
				groups, resp, err := c.client.Groups.ListGroups(opts)
				if err != nil {
					select {
					case errCh <- fmt.Errorf("failed to list groups: %w", err):
					default:
					}
					return
				}

				groupsCh <- groups

				// Add delay to avoid hitting rate limits
				time.Sleep(30 * time.Second)

				if resp.CurrentPage >= resp.TotalPages {
					return
				}
				opts.Page = resp.NextPage
			}
		}
	}()

	for groups := range groupsCh {
		for _, group := range groups {
			wg.Add(1)
			go func(group *gitlab.Group) {
				defer wg.Done()
				mu.Lock()
				allGroups = append(allGroups, group)
				mu.Unlock()

				subgroups, err := c.fetchSubgroups(ctx, group.ID, log)
				if err != nil {
					log.Error("Failed to fetch subgroups for group for groupId: %d, Error: %v", group.ID, err)
					return
				}

				mu.Lock()
				allGroups = append(allGroups, subgroups...)
				mu.Unlock()
			}(group)
		}
	}

	wg.Wait()

	select {
	case err := <-errCh:
		return nil, err
	default:
	}

	return allGroups, nil
}

func (c *gitLabClient) fetchSubgroups(ctx context.Context, groupID int64, log *log.Logger) ([]*gitlab.Group, error) {
	var (
		subgroups []*gitlab.Group
		mu        sync.Mutex
		wg        sync.WaitGroup
	)

	opts := &gitlab.ListSubGroupsOptions{
		ListOptions: gitlab.ListOptions{PerPage: 100, Page: 1},
	}

	subgroupsCh := make(chan []*gitlab.Group)
	go func() {
		defer close(subgroupsCh)
		for {
			select {
			case <-ctx.Done():
				return
			default:
				groups, resp, err := c.client.Groups.ListSubGroups(groupID, opts)
				if err != nil {
					log.Error("Failed to list subgroups for group for groupId: %d, Error: %v", groupID, err)
					return
				}

				subgroupsCh <- groups

				// Add delay to avoid hitting rate limits
				time.Sleep(5 * time.Second)

				if resp.CurrentPage >= resp.TotalPages {
					return
				}
				opts.Page = resp.NextPage
			}
		}
	}()

	for groups := range subgroupsCh {
		for _, subgroup := range groups {
			wg.Add(1)
			go func(subgroup *gitlab.Group) {
				defer wg.Done()

				mu.Lock()
				subgroups = append(subgroups, subgroup)
				mu.Unlock()

				subSubgroups, err := c.fetchSubgroups(ctx, subgroup.ID, log)
				if err != nil {
					log.Error("Failed to fetch sub-subgroups for groupId: %d, Error: %v", subgroup.ID, err)
					return
				}

				mu.Lock()
				subgroups = append(subgroups, subSubgroups...)
				mu.Unlock()
			}(subgroup)
		}
	}

	wg.Wait()
	return subgroups, nil
}

func Execute(config map[string]string, vars map[string]string, log *log.Logger) (string, error) {
	log.Info("incoming config %v", config)
	// your logic for data extraction
	gitlabToken := config["gitlabToken"]
	if gitlabToken == "" {
		log.Info("missing gitlabToken")
		return "", fmt.Errorf("missing gitlab token")
	}

	gitlabBaseUrl := config["gitlabBaseUrl"]
	if gitlabBaseUrl == "" {
		log.Info("missing gitlabBaseUrl")
		return "", fmt.Errorf("missing gitlab baseurl")
	}

	reportDurationDays := 0
	reportDurationDaysString := config["reportDurationDays"]
	if reportDurationDaysString == "" {
		log.Info("report duration not found. Setting default value to 7.")
		reportDurationDays = 7
	} else {
		num, err := strconv.Atoi(reportDurationDaysString) // Converts string to int
		if err != nil {
			log.Error("invalid reportDuration days: %s", reportDurationDaysString)
			reportDurationDays = 7
		}
		reportDurationDays = num
	}

	reportGroupId := config["reportGroupId"]
	if reportGroupId == "" {
		log.Info("invalid reportGroupId, setting default value to 4413")
		reportGroupId = "4413"
	}

	packetsString := config["packets"]
	if packetsString == "" {
		log.Info("invalid packets, setting default value to 100")
		packetsString = "100"
	}
	packets, err := strconv.Atoi(packetsString)
	if err != nil {
		log.Info("invalid packets, setting default value to 100")
		packets = 100
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	client, err := NewGitLabClient(gitlabToken, gitlabBaseUrl)
	if err != nil {
		return "", err
	}
	log.Info("gitlabClient creation successfull")
	groups, err := client.ListGroups(ctx, log)
	if err != nil {
		return "", fmt.Errorf("failed to fetch groups: %w", err)
	}
	if len(groups) == 0 {
		log.Info("group data not found")
		log.Info("fetched %d groups", len(groups))
		return "", fmt.Errorf("no groups found")
	}
	log.Info("fetched %d groups", len(groups))

	data := []MyEvent{}

	var grp []gitlab.Group
	numberOfGroupsAdded := 0

	for _, g := range groups {
		if g != nil {
			grp = append(grp, *g)
			numberOfGroupsAdded++
		}
		if numberOfGroupsAdded < packets {
			continue
		} else {
			data = append(data, MyEvent{
				GitlabBaseUrl:      gitlabBaseUrl,
				GitlabToken:        gitlabToken,
				Groups:             grp,
				ReportDurationDays: reportDurationDays,
				ReportGroupId:      reportGroupId,
			})
			grp = []gitlab.Group{}
			numberOfGroupsAdded = 0
		}
	}
	if len(grp) > 0 {
		data = append(data, MyEvent{
			GitlabBaseUrl:      gitlabBaseUrl,
			GitlabToken:        gitlabToken,
			Groups:             grp,
			ReportDurationDays: reportDurationDays,
			ReportGroupId:      reportGroupId,
		})
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}
