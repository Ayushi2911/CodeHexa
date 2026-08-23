const WorkflowRun =
  require(
    "../models/WorkflowRun"
  );

async function createRun(
  workflow,
  triggerPayload,
  dryRun = false
) {
  return WorkflowRun.create({
    workflowId:
      workflow._id,

    workflowName:
      workflow.workflowName,

    workflowVersion:
      workflow.version,

    projectName:
      workflow.projectName,

    triggerPayload,

    status: "running",

    stepResults: [],

    startedAt:
      new Date(),

    dryRun,
  });
}

async function appendStepResult(
  runId,
  result
) {
  return WorkflowRun
    .findByIdAndUpdate(
      runId,

      {
        $push: {
          stepResults:
            result,
        },
      },

      {
        new: true,
      }
    );
}

async function finishRun(
  runId,
  status
) {
  const run =
    await WorkflowRun
      .findById(runId);

  if (!run) {
    return null;
  }

  run.status = status;

  run.completedAt =
    new Date();

  run.totalDurationMs =
    Math.max(
      0,
      run.completedAt.getTime() -
        new Date(
          run.startedAt
        ).getTime()
    );

  await run.save();

  return run;
}

module.exports = {
  createRun,
  appendStepResult,
  finishRun,
};