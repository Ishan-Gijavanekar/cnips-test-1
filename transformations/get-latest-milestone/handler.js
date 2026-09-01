const axios = require('axios');
module.exports = async function (event, ctx, config, vars) {
    //add your script here to transform or enrich the event
    console.log('TRANSFORMATION - LATEST MILESTONE')

    try{
        const project_list = JSON.parse(vars["PROJECT_LIST"]);
        const milestoneUrl = config.gitlabBaseUrl + "/api/v4/projects/" + project_list[0]?.componentID + "/milestones?state=active"
        const currentMilestone = await axios.get(milestoneUrl, {
                headers: {
                    'Authorization': config.gitlabToken,
                    'Content-Type': 'application/json',
                }
        })
        console.log("CURRENT MILESTONE");
        console.debug(JSON.stringify(currentMilestone));
    }catch(error){
        console.log('ERROR')
        console.log(error)
    }

    //remember to return the transformed event object for the pipeline to continue processing the event
    return event;
}