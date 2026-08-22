export function createExecutionState(workflow) {
  return workflow.steps.map((step) => ({
    stepId: step.id,
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

  for (const step of workflow.steps) {
    let attempts = 0;
    let success = false;

    while (attempts <= maxRetries && !success) {
      attempts += 1;

      // Step starts running
      onStepUpdate(step.id, "running", attempts);

      await delay(1500);

      // Simulate failure only for the selected step
      const shouldFail =
        step.id === failStepId &&
        attempts === 1;

      if (shouldFail) {
        onStepUpdate(step.id, "failed", attempts);

        // If retries are available, show retrying state
        if (attempts <= maxRetries) {
          await delay(800);
          onStepUpdate(step.id, "retrying", attempts);
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
      onStepUpdate(step.id, "success", attempts);
    }
  }

  return {
    status: "completed",
    message: "Workflow executed successfully."
  };
}