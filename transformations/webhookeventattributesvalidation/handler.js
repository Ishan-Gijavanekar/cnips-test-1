module.exports = function (event, ctx, config, vars) {
  console.log("Inside WebhookEventFieldsValidation transformation");

  try {
    const myEvent = typeof event === 'string' ? JSON.parse(event) : event;

    // Perform combined validation
    const errorMessages = validateEvent(myEvent);

    // Set errorMsg if any error exists
    if (errorMessages.length > 0) {
      myEvent.errorMsg = errorMessages.join(' \n ');
    }

    return myEvent;
  } catch (err) {
    console.log("Error processing event:", err);
    throw err;
  }
};

// Combined validation function
function validateEvent(event) {
  const errorMessages = [];
  
  // Step 1: Validate base required fields
  const baseRequiredFields = {
    actorId: event?.actorId,
    eventtype: event?.eventtype,
    createTime: event?.createTime,
    objectId:event?.objectId,
    tenantKey: event?.tenantKey,
    objectType:event?.objectType,
    client_id: event?.client_id,
  };

  const missingBaseFields = Object.entries(baseRequiredFields)
    .filter(([_, value]) => typeof value !== 'string' || value.trim() === "")
    .map(([key]) => key);

  if (missingBaseFields.length > 0) {
    errorMessages.push(`Missing required fields: ${missingBaseFields.join(", ")}`);
  }

  // Step 2: Additional check if objectType is 'users'
  if (event?.objectType === "users") {
    const userFields = {
      sub: event?.sub,
      userId: event?.userId,
    };

    const missingUserFields = Object.entries(userFields)
      .filter(([_, value]) => typeof value !== 'string' || value.trim() === "")
      .map(([key]) => key);

    if (missingUserFields.length > 0) {
      errorMessages.push(`Missing required fields for objectType 'users': ${missingUserFields.join(", ")}`);
    }
  }

  // Step 3: Check metadata attributes if WebhookAttributes are present
  if (Array.isArray(event?.WebhookAttributes) && event.WebhookAttributes.length) {
    for (const attr of event.WebhookAttributes) {
      if (attr._id === event.eventtype) {
        const missingAttributes = validateEventAttributes(event.metaData || {}, attr.relatedAttributes || []);
        if (missingAttributes.length > 0) {
          errorMessages.push(`Missing required attributes in metadata: ${missingAttributes.join(", ")}`);
        }
      }
    }
  }

  return errorMessages;
}

// Validate if attributes exist in metadata
function validateEventAttributes(metaData = {}, requiredAttrs = []) {
  return requiredAttrs.filter(attr => !(attr in metaData));
}  
