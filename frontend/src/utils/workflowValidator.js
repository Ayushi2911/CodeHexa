export function validateWorkflow(workflow) {
  const errors = [];

  if (!workflow) {
    return {
      isValid: false,
      errors: ["No workflow found."]
    };
  }

  if (!workflow.name || !workflow.name.trim()) {
    errors.push("Workflow name is required.");
  }

  if (!workflow.trigger) {
    errors.push("Workflow trigger is required.");
  } else {
    if (!workflow.trigger.name?.trim()) {
      errors.push("Trigger name is required.");
    }

    if (!workflow.trigger.type?.trim()) {
      errors.push("Trigger type is required.");
    }
  }

  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    errors.push("Workflow must contain at least one step.");
  } else {
    workflow.steps.forEach((step, index) => {
      const stepNumber = index + 1;

      if (!step.name?.trim()) {
        errors.push(`Step ${stepNumber}: Name is required.`);
      }

      if (!step.type?.trim()) {
        errors.push(`Step ${stepNumber}: Type is required.`);
      }

      if (!step.target?.trim()) {
        errors.push(`Step ${stepNumber}: Target is required.`);
      }

      if (!step.onSuccess?.trim()) {
        errors.push(`Step ${stepNumber}: On Success path is required.`);
      }

      if (!step.onFailure?.trim()) {
        errors.push(`Step ${stepNumber}: On Failure path is required.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}