module.exports = function (event, ctx, config, vars) {
  console.log("Checking for error message in event...");

  // Return true if the event has an error message, otherwise false
  const result = hasErrorMessage(event);
  console.log(`Event error status: ${result ? 'Error found' : 'No error'}`);

  // Return true to stop the pipeline if error exists, otherwise false to proceed
  return result;
}

function hasErrorMessage(event) {
  return !!(event?.errorMsg && typeof event.errorMsg === 'string' && event.errorMsg.trim() !== '');
}
