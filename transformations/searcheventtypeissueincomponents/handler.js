module.exports = function (event, ctx, config, vars) {
    try {
        // Parse the incoming event JSON if it's a string
        const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

        // 
        myEvent.gitlabSearchData = {};
        myEvent.gitlabSearchResponse = {};   

        console.log("sasadwrerr===========", myEvent);

        // Parse GLOBAL_WEBHOOK_COMPONENT_DATA if it's a string
        const factEventDetails = typeof vars["GLOBAL_WEBHOOK_COMPONENT_DATA"] === 'string' 
            ? JSON.parse(vars["GLOBAL_WEBHOOK_COMPONENT_DATA"]) 
            : vars["GLOBAL_WEBHOOK_COMPONENT_DATA"];

        // console.log("Fact Event Details:", factEventDetails);

        const projectID = GetComponentProjectID(myEvent.eventtype, factEventDetails);
        
        if (!projectID) {
            console.log(`No matching project found for event type: ${myEvent.eventtype}`);
            return myEvent;
        }

        const title = `[Webhook Automation] Missing Required Webhook Attributes for ${myEvent.eventtype}`;

        myEvent.gitlabSearchData = {
            title,
            state: "opened",
            iid: projectID
        };

        console.log("Updated myEvent with GitLab search data:", myEvent.gitlabSearchData);

        return myEvent;
    } catch (error) {
        console.error("Error processing event or GLOBAL_WEBHOOK_COMPONENT_DATA:", error);
        return event; // Return original event in case of an error to avoid pipeline failure
    }
};

// Function to get the project ID by matching the event type
function GetComponentProjectID(eventType, factEventDetails) {
    for (const entry of factEventDetails) {
        if (entry?.facts?.includes(eventType)) {
            return entry.projectId;
        }
    }
    return 0;
}
