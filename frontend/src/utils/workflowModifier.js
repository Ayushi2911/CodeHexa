export function modifyWorkflow(workflow, command) {
  const text = (command || "").toLowerCase();

  // Create a copy so we do not directly modify React state
  const updatedWorkflow = {
    ...workflow,
    steps: [...(workflow?.steps || [])]
  };

  // Add email / notification step
  if (
    text.includes("add") &&
    (text.includes("email") || text.includes("notification"))
  ) {
    const newStep = {
      id: crypto.randomUUID(),
      type: "function",
      actionType: "function",
      name: "Send Email Notification",
      target: "sendEmail",

      inputMapping: {
        customerId: "{{trigger.customerId}}",
        message: "{{input.message}}"
      },

      onSuccess: "end",
      onFailure: "stop"
    };

    updatedWorkflow.steps.push(newStep);

    return {
      workflow: updatedWorkflow,
      message: "Added an email notification step."
    };
  }

  // Add approval step
  if (
    text.includes("add") &&
    text.includes("approval")
  ) {
    const newStep = {
      id: crypto.randomUUID(),
      type: "action",
      actionType: "approval",
      name: "Request Approval",
      target: "approval",

      inputMapping: {
        workflowId: "{{workflow.workflowId}}"
      },

      onSuccess: "next",
      onFailure: "stop"
    };

    updatedWorkflow.steps.push(newStep);

    return {
      workflow: updatedWorkflow,
      message: "Added an approval step."
    };
  }

  // Remove a step by matching its name
  if (text.includes("remove")) {
    const originalLength = updatedWorkflow.steps.length;

    updatedWorkflow.steps = updatedWorkflow.steps.filter(
      (step) => !text.includes(step.name.toLowerCase())
    );

    if (updatedWorkflow.steps.length < originalLength) {
      return {
        workflow: updatedWorkflow,
        message: "Removed the requested workflow step."
      };
    }

    return {
      workflow,
      message: "I could not find the step you wanted to remove."
    };
  }

  // Rename a step using: rename X to Y
  if (text.includes("rename") && text.includes(" to ")) {
    const renameText = text.replace("rename", "").trim();
    const [oldName, newName] = renameText.split(" to ");

    const stepToRename = updatedWorkflow.steps.find(
      (step) =>
        step.name.toLowerCase() === oldName.trim()
    );

    if (stepToRename && newName?.trim()) {
      stepToRename.name = newName.trim();

      return {
        workflow: updatedWorkflow,
        message: `Renamed "${oldName.trim()}" to "${newName.trim()}".`
      };
    }
  }

  return {
    workflow,
    message:
      "I could not understand that command yet. Try adding an email, adding approval, removing a step, or renaming a step."
  };
}
