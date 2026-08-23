const STORAGE_KEY = "hackathon_saved_workflows";

export function getSavedWorkflows() {
  const savedWorkflows = localStorage.getItem(STORAGE_KEY);

  if (!savedWorkflows) {
    return [];
  }

  try {
    return JSON.parse(savedWorkflows);
  } catch (error) {
    console.error("Error loading saved workflows:", error);
    return [];
  }
}

export function saveWorkflow(workflow) {
  const savedWorkflows = getSavedWorkflows();

  const workflowToSave = {
    ...workflow,
    savedAt: new Date().toLocaleString()
  };

  const existingIndex = savedWorkflows.findIndex(
    (item) => item.workflowId === workflow.workflowId
  );

  if (existingIndex !== -1) {
    savedWorkflows[existingIndex] = workflowToSave;
  } else {
    savedWorkflows.unshift(workflowToSave);
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(savedWorkflows)
  );

  return getSavedWorkflows();
}

export function deleteSavedWorkflow(workflowId) {
  const updatedWorkflows = getSavedWorkflows().filter(
    (workflow) => workflow.workflowId !== workflowId
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedWorkflows)
  );

  return updatedWorkflows;
}
