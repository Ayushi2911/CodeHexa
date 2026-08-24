export function createExecutionRecord(workflow) {
  return {
    id: crypto.randomUUID(),
    workflowId: workflow.workflowId || workflow.id || workflow._id,
    workflowName: workflow.name,
    status: "running",
    startedAt: new Date().toLocaleTimeString(),
    completedAt: null,
    steps: (workflow.steps || []).map((step) => ({
      stepId: step.id,
      stepName: step.name,
      status: "pending"
    }))
  };
}

export function updateExecutionStep(
  execution,
  stepId,
  status
) {
  return {
    ...execution,
    steps: (execution.steps || []).map((step) =>
      step.stepId === stepId
        ? { ...step, status }
        : step
    )
  };
}

export function completeExecution(execution) {
  return {
    ...execution,
    status: "completed",
    completedAt: new Date().toLocaleTimeString()
  };
}
