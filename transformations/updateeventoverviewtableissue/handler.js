module.exports = function (event, ctx, config, vars) {
    console.log("UpdateEventOverviewTableIssue");
    try {
        const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

        const description = updateOverviewTableDescription(myEvent, myEvent.fetchGitlabResposne.description);

        if (description) {

            myEvent.gitlabIssueUpdateReq = {
                "iid": myEvent.gitlabEventOverviewInfo.issueId,
                "projectId": myEvent.gitlabEventOverviewInfo.projectId,
                "description": description,
                "labels": [
                    "Status::ToDo",
                    "Type::Automation"
                ]
            }
        } else {
            myEvent.gitlabIssueUpdateReq = {};
        }

        // Return the transformed event object for further processing
        return myEvent;
    } catch (err) {
        console.error("Error processing event:", err);
        throw err;
    }
};

function updateOverviewTableDescription(event, description) {
    const lines = description.split('\n');
    const headerIndex = lines.findIndex(line => line.includes('| Event Type | Status | Ticket Link |'));

    if (headerIndex === -1) {
        console.log('Event Overview Table not found.');
        return description;
    }

    for (let i = headerIndex + 2; i < lines.length; i++) {
        const columns = lines[i].split('|').map(col => col.trim());

        if (columns.length >= 4 && columns[1] === event.eventtype) {
            if (event.errorMsg) {
                columns[2] = 'Failed';
                if (event.gitlabCreateEventTypeResposne.web_url) {
                    columns[3] = `[GitLab Issue #${event.gitlabCreateEventTypeResposne.web_url.split('/').pop()}](${event.gitlabCreateEventTypeResposne.web_url})`;
                } else {
                    console.log(`Issue link missing for failed event type: ${event.eventtype}`);
                    columns[3] = 'No Issue Link';
                }
            } else {
                columns[2] = 'Success';
                columns[3] = '-';
            }
            lines[i] = `| ${columns[1]} | ${columns[2]} | ${columns[3]} |`;
            console.log(`Updated status to ${columns[2]} for event type: ${event.eventtype}`);
            break;
        }
    }

    return lines.join('\n');   
} 
