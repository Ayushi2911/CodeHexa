const axios =
  require("axios");

const {
  resolveMapping,
} = require(
  "../utils/mappingResolver"
);

const {
  evaluateCondition,
} = require(
  "../utils/conditionEvaluator"
);

const logger =
  require(
    "./workflowLogger"
  );

function orderedSteps(
  workflow
) {
  return [
    ...(workflow.steps || []),
  ].sort(
    (a, b) =>
      a.order - b.order
  );
}

function nextSequential(
  steps,
  stepId
) {
  const index =
    steps.findIndex(
      (step) =>
        step.stepId ===
        stepId
    );

  return index >= 0
    ? steps[index + 1]
        ?.stepId || null
    : null;
}

async function invokeAction(
  step,
  input,
  projectName,
  apiBase
) {
  let url;

  let body = {
    projectName,
    ...input,
  };

  switch (
    step.actionType
  ) {
    case "function":
      url =
        `${apiBase}/forms/function/` +
        encodeURIComponent(
          step.functionName
        );
      break;

    case "formCreate":
      url =
        `${apiBase}/forms/formCreate/` +
        encodeURIComponent(
          step.schema
        );
      break;

    case "formUpdate":
      url =
        `${apiBase}/forms/formUpdate/` +
        encodeURIComponent(
          step.schema
        );
      break;

    case "formDelete":
      url =
        `${apiBase}/forms/formDelete/` +
        encodeURIComponent(
          step.schema
        );
      break;

    case "operation":
      url =
        `${apiBase}/forms/operation`;

      body = {
        projectName,
        formId:
          step.formId,
        buttonId:
          step.buttonId,
        ...input,
      };

      break;

    default:
      throw new Error(
        `Unsupported actionType ${step.actionType}`
      );
  }

  const response =
    await axios.post(
      url,
      body,
      {
        timeout:
          Number(
            process.env
              .ACTION_TIMEOUT_MS ||
              4000
          ),
      }
    );

  if (
    response.data?.ok ===
      false ||
    response.data?.success ===
      false
  ) {
    throw new Error(
      response.data?.error
        ?.message ||
        response.data
          ?.message ||
        "Step API returned failure"
    );
  }

  return (
    response.data?.data ??
    response.data?.result ??
    response.data ??
    {}
  );
}

async function executeWorkflow(
  workflow,
  triggerPayload = {},
  options = {}
) {
  const dryRun =
    Boolean(
      options.dryRun
    );

  const apiBase =
    options.apiBase ||
    process.env
      .API_BASE_URL ||
    `http://127.0.0.1:${
      process.env.PORT ||
      4000
    }`;

  const steps =
    orderedSteps(
      workflow
    );

  const byId =
    new Map(
      steps.map(
        (step) => [
          step.stepId,
          step,
        ]
      )
    );

  const context = {
    trigger:
      triggerPayload,
  };

  const run =
    options.persist ===
      false
      ? null
      : await logger.createRun(
          workflow,
          triggerPayload,
          dryRun
        );

  const results = [];

  let currentId =
    steps[0]?.stepId ||
    null;

  let guard = 0;
  let partial = false;

  while (currentId) {
    if (
      ++guard >
      steps.length * 3 + 3
    ) {
      throw new Error(
        "Execution guard stopped a possible cycle"
      );
    }

    const step =
      byId.get(
        currentId
      );

    if (!step) {
      throw new Error(
        `Unknown step ${currentId}`
      );
    }

    const startedAt =
      new Date();

    let result;

    if (step.isDisabled) {
      result = {
        stepId:
          step.stepId,

        name:
          step.name,

        status:
          "skipped",

        input: {},

        output: {},

        reason:
          "step disabled",

        durationMs: 0,

        startedAt,

        completedAt:
          new Date(),
      };

      context[
        step.stepId
      ] = {};

      currentId =
        step.onSuccess ||
        nextSequential(
          steps,
          step.stepId
        );
    } else {
      let conditionPassed;

      try {
        conditionPassed =
          evaluateCondition(
            step.condition,
            context
          );
      } catch (error) {
        conditionPassed =
          false;

        result = {
          stepId:
            step.stepId,

          name:
            step.name,

          status:
            "failed",

          input: {},

          output: {},

          error:
            `Condition error: ${error.message}`,

          durationMs:
            Date.now() -
            startedAt.getTime(),

          startedAt,

          completedAt:
            new Date(),
        };
      }

      if (
        result?.status ===
        "failed"
      ) {
        partial = true;
        currentId = null;
      } else if (
        !conditionPassed
      ) {
        result = {
          stepId:
            step.stepId,

          name:
            step.name,

          status:
            "skipped",

          input: {},

          output: {},

          reason:
            "condition not met",

          durationMs:
            Date.now() -
            startedAt.getTime(),

          startedAt,

          completedAt:
            new Date(),
        };

        context[
          step.stepId
        ] = {};

        currentId =
          step.onSuccess ||
          nextSequential(
            steps,
            step.stepId
          );
      } else {
        let input = {};

        try {
          input =
            resolveMapping(
              step.inputMapping ||
                {},
              context
            );

          const output =
            dryRun
              ? {
                  dryRun: true,
                  resolvedInput:
                    input,
                }
              : await invokeAction(
                  step,
                  input,
                  workflow.projectName,
                  apiBase
                );

          context[
            step.stepId
          ] =
            output || {};

          result = {
            stepId:
              step.stepId,

            name:
              step.name,

            status:
              "success",

            input,

            output:
              output || {},

            durationMs:
              Date.now() -
              startedAt.getTime(),

            startedAt,

            completedAt:
              new Date(),
          };

          currentId =
            step.onSuccess ||
            nextSequential(
              steps,
              step.stepId
            );
        } catch (error) {
          result = {
            stepId:
              step.stepId,

            name:
              step.name,

            status:
              "failed",

            input,

            output: {},

            error:
              error.message,

            durationMs:
              Date.now() -
              startedAt.getTime(),

            startedAt,

            completedAt:
              new Date(),
          };

          partial = true;

          if (
            step.onFailure ===
            "skip"
          ) {
            currentId =
              step.onSuccess ||
              nextSequential(
                steps,
                step.stepId
              );
          } else if (
            step.onFailure &&
            step.onFailure !==
              "abort"
          ) {
            currentId =
              step.onFailure;
          } else {
            currentId =
              null;
          }
        }
      }
    }

    results.push(result);

    if (run) {
      await logger
        .appendStepResult(
          run._id,
          result
        );
    }
  }

  const failed =
    results.some(
      (result) =>
        result.status ===
        "failed"
    );

  const finalStatus =
    failed
      ? partial &&
        results.some(
          (result) =>
            result.status ===
            "success"
        )
        ? "partial"
        : "failed"
      : "completed";

  const finishedRun =
    run
      ? await logger
          .finishRun(
            run._id,
            finalStatus
          )
      : null;

  return {
    runId:
      finishedRun?._id
        ?.toString() ||
      null,

    status:
      finalStatus,

    stepResults:
      results,

    context,
  };
}

module.exports = {
  executeWorkflow,
  invokeAction,
};