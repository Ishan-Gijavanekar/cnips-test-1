module.exports = function (event, ctx, config, vars) {
  console.log("Inside transformation");

  try {
    // Parse the incoming event JSON
    const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

    // Convert projectId to int
    const projectId = parseInt(config.automation_project_id, 10);
    if (isNaN(projectId)) {
      throw new Error(`Invalid projectId: ${config.automation_project_id}`);
    }
     // Validate required fields
    if (!myEvent.tenantKey || !myEvent.cidaasVersion) {
      throw new Error('Missing required fields: tenantKey and/or cidaasVersion');
    }

    // Create GitLab search data
    const title = `Event Overview Table ${myEvent.cidaasVersion || ''} (${myEvent.tenantKey || ''})`;
    myEvent.gitlabSearchData = {
      title: title,
      state: "opened",
      iid: projectId,
    };

    console.log("gitlabSearchData:", myEvent.gitlabSearchData);

    // Return the transformed event
    return myEvent;
  } catch (error) {
    console.error("Error in transformation:", error);
    return { error: error.message, event };
  }
};
