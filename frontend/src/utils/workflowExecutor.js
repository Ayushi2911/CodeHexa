export function createExecutionState(workflow) {
  return (workflow?.steps || []).map((step) => ({
    stepId: step.id || step.stepId,
    status: "pending",
    attempts: 0
  }));
}

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function executeWorkflow(
  workflow,
  onStepUpdate,
  options = {}
) {
  const {
    failStepId = null,
    maxRetries = 1
  } = options;

  for (const step of (workflow?.steps || [])) {
    const stepKey = step.id || step.stepId;
    let attempts = 0;
    let success = false;

    while (attempts <= maxRetries && !success) {
      attempts += 1;

      // Step starts running
      onStepUpdate(stepKey, "running", attempts);

      await delay(1200);

      // Simulate failure only for the selected step
      const shouldFail =
        stepKey === failStepId &&
        attempts === 1;

      if (shouldFail) {
        onStepUpdate(stepKey, "failed", attempts);

        // If retries are available, show retrying state
        if (attempts <= maxRetries) {
          await delay(800);
          onStepUpdate(stepKey, "retrying", attempts);
          await delay(800);
          continue;
        }

        return {
          status: "failed",
          message: `Workflow failed at step: ${step.name}`
        };
      }

      // Step completed successfully
      success = true;
      onStepUpdate(stepKey, "success", attempts);
    }
  }

  return {
    status: "completed",
    message: "Workflow executed successfully."
  };
}
