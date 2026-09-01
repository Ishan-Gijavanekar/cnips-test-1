module.exports = function (event, ctx, config, vars) {
    console.log("FetchEventOverviewIssue");
    try {
        const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

        // Create the fetchGitlabData object and add it to the event
        myEvent.fetchGitlabReqData = {
            "state": "opened",
            "iid": myEvent.gitlabEventOverviewInfo.issueId,
            "project_id": myEvent.gitlabEventOverviewInfo.projectId
        };

        console.log("Updated event with fetchGitlabData:", myEvent);
        // Return the transformed event object for further processing
        return myEvent;
    } catch (err) {
        console.log("Error processing event:", err);
        throw err;
    }
};
