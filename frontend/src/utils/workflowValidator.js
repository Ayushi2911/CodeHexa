export function validateWorkflow(workflow) {
  const errors = [];

  if (!workflow) {
    return {
      isValid: false,
      errors: ["No workflow found."]
    };
  }

  const payload = workflow.workflow || workflow;

  if (!payload.name || !String(payload.name).trim()) {
    errors.push("Workflow name is required.");
  }

  const trigger = payload.trigger || (Array.isArray(payload.nodes)
    ? payload.nodes.find((node) => node?.type === "trigger")
    : null);

  if (!trigger && !Array.isArray(payload.nodes)) {
    errors.push("Workflow trigger is required.");
  }

  if (trigger) {
    const triggerName = trigger.name || trigger.label;
    const triggerType = trigger.type;

    if (!triggerName || !String(triggerName).trim()) {
      errors.push("Trigger name is required.");
    }

    if (!triggerType || !String(triggerType).trim()) {
      errors.push("Trigger type is required.");
    }
  }

  const steps = Array.isArray(payload.steps)
    ? payload.steps
    : Array.isArray(payload.nodes)
      ? payload.nodes.filter((node) => node?.type !== "trigger")
      : [];

  if (!steps.length) {
    errors.push("Workflow must contain at least one step or node.");
  } else {
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      const stepName = step.name || step.label || step.id || `Step ${stepNumber}`;
      const stepType = step.type || step.actionType || "action";
      const target = step.target || step.config?.target || step.id;

      if (!String(stepName).trim()) {
        errors.push(`Step ${stepNumber}: Name is required.`);
      }

      if (!String(stepType).trim()) {
        errors.push(`Step ${stepNumber}: Type is required.`);
      }

      if (!Array.isArray(payload.steps) && !target) {
        errors.push(`Step ${stepNumber}: Target is required.`);
      }

      if (Array.isArray(payload.steps)) {
        if (!step.onSuccess && !step.onFailure) {
          errors.push(`Step ${stepNumber}: On Success/Failure path is required.`);
        } else {
          if (!step.onSuccess || !String(step.onSuccess).trim()) {
            errors.push(`Step ${stepNumber}: On Success path is required.`);
          }

          if (!step.onFailure || !String(step.onFailure).trim()) {
            errors.push(`Step ${stepNumber}: On Failure path is required.`);
          }
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}