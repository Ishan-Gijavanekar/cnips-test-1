module.exports = function (config) {
  // Validate input config and extract projects data
  if (!config || !config.projects) {
    console.error('Invalid config or missing projects data');
    return [];
  }

  let projectsData = config.projects;
  console.log("Initial projectsData:", projectsData);

  // Attempt to parse projectsData if it is a string
  if (typeof projectsData === 'string') {
    try {
      projectsData = JSON.parse(projectsData);
    } catch (error) {
      console.error('Error parsing projectsData:', error);
      return [];
    }
  }

  if (!Array.isArray(projectsData)) {
    console.error('projectsData is not an array');
    return [];
  }
   let data = ["hello", "world"];
  //always return your data as an array.

  console.log("Returning projectsData:", projectsData);
  return data;
};
