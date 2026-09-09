import { MarkerType } from '@xyflow/react';

export function humanizeName(str) {
  if (!str) return '';
  return String(str)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatCondition(condition) {
  if (!condition) return null;
  if (typeof condition === 'string') return condition;
  if (typeof condition === 'object') {
    const field = (condition.field || '').replace(/[{}]/g, '');
    const op = condition.operator === 'eq' ? '==' : condition.operator === 'neq' ? '!=' : condition.operator || '==';
    const val = condition.value !== undefined ? condition.value : 'true';
    return `${field} ${op} "${val}"`;
  }
  return null;
}

export function isDecisionStep(step) {
  if (!step) return false;
  return Boolean(
    step.type === 'decision' ||
    step.actionType === 'decision' ||
    /verify|check|if|approval|validate|isapproved|isvalid|ok\?/i.test(step.name || '')
  );
}

export function isRetryStep(step) {
  if (!step) return false;
  return Boolean(
    step.type === 'retry' ||
    step.actionType === 'retry' ||
    Boolean(step.retryTarget) ||
    /^retry\b/i.test(step.name || '')
  );
}

export function isFailureStep(step) {
  if (!step) return false;
  return Boolean(
    step.condition?.value === 'failed' ||
    step.condition?.value === 'false' ||
    step.condition?.value === 'rejected' ||
    /cancel|reject|fail|abort|error|reversal|alert/i.test(step.name || '')
  );
}

export function buildGraphFromWorkflow(workflow, options = {}) {
  if (!workflow) {
    return { nodes: [], edges: [] };
  }

  const {
    isDetailed = true,
    executionState = [],
    selectedStepId = null,
    onDoubleClickStep = null,
  } = options;

  const rawSteps = workflow.steps || [];
  const nodes = [];
  const edges = [];

  const trigger = workflow.trigger || {
    name: workflow.triggerEvent?.schema
      ? `${humanizeName(workflow.triggerEvent.schema)} Placed`
      : 'Order Placed',
    source: workflow.triggerEvent?.schema || 'orders',
  };

  // Coordinates and constants
  const X_CENTER = 320;
  const X_FALLBACK = 720;
  const Y_GAP = isDetailed ? 180 : 130;
  let currentY = 160;

  // 1. TRIGGER NODE
  nodes.push({
    id: 'trigger',
    type: 'triggerNode',
    position: { x: X_CENTER, y: 20 },
    data: {
      name: humanizeName(trigger.name || 'Workflow Started'),
      source: trigger.source || 'trigger',
      isDetailed,
      onDoubleClick: onDoubleClickStep,
    },
    selected: selectedStepId === 'trigger',
  });

  if (rawSteps.length === 0) {
    nodes.push({
      id: 'complete',
      type: 'completeNode',
      position: { x: X_CENTER, y: 180 },
      data: {
        name: 'Workflow Finished',
        subtext: 'Process terminates successfully',
      },
    });

    edges.push({
      id: 'e-trigger-complete',
      source: 'trigger',
      target: 'complete',
      type: 'smoothstep',
      style: { stroke: '#a855f7', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
    });

    return { nodes, edges };
  }

  // Filter steps for Basic vs Detailed view
  let activeSteps = rawSteps;
  if (!isDetailed) {
    // In Basic view: only render the primary happy path steps without the extra failure/retry branch clutter
    activeSteps = rawSteps.filter((s) => !isRetryStep(s) && !isFailureStep(s));
    if (activeSteps.length === 0) {
      activeSteps = rawSteps;
    }
  }

  // Partition steps into Happy Path vs Fallback Lane
  const happySteps = [];
  const fallbackSteps = [];

  activeSteps.forEach((step, idx) => {
    if (isDetailed && (isFailureStep(step) || isRetryStep(step))) {
      fallbackSteps.push({ ...step, originalIdx: idx });
    } else {
      happySteps.push({ ...step, originalIdx: idx });
    }
  });

  const stepIdToNodeId = new Map();

  // 2. RENDER HAPPY PATH STEPS
  happySteps.forEach((step, idx) => {
    const stepKey = step.id || step.stepId || `step-${idx + 1}`;
    const isSelected = selectedStepId === stepKey;
    const exec = executionState.find((e) => e.stepId === stepKey || e.stepId === step.id);
    const status = exec?.status || step.status || 'pending';

    const isDecision = isDecisionStep(step);
    const isRetry = isRetryStep(step);
    const nodeId = stepKey;
    stepIdToNodeId.set(stepKey, nodeId);

    const nodeData = {
      id: stepKey,
      stepId: stepKey,
      order: idx + 1,
      name: humanizeName(step.name || `Step ${idx + 1}`),
      actionType: step.actionType || step.type || (isDecision ? 'decision' : 'function'),
      target: step.functionName || step.schema || step.target || (step.formId ? `${step.formId}/${step.buttonId || 'btn'}` : null),
      inputCount: Object.keys(step.inputMapping || {}).length,
      description: step.description || null,
      condition: step.condition,
      conditionLabel: formatCondition(step.condition) || (isDecision ? 'Validate Condition' : null),
      retryTarget: step.retryTarget || null,
      status,
      isDetailed,
      onDoubleClick: onDoubleClickStep,
    };

    let nodeType = 'actionNode';
    if (isDecision) nodeType = 'decisionNode';
    else if (isRetry) nodeType = 'retryNode';

    nodes.push({
      id: nodeId,
      type: nodeType,
      position: { x: X_CENTER, y: currentY },
      data: nodeData,
      selected: isSelected,
    });

    currentY += Y_GAP;
  });

  // 3. RENDER FALLBACK / RETRY STEPS
  let fallbackY = 160 + Y_GAP;
  fallbackSteps.forEach((step, idx) => {
    const stepKey = step.id || step.stepId || `fallback-${idx + 1}`;
    const isSelected = selectedStepId === stepKey;
    const exec = executionState.find((e) => e.stepId === stepKey || e.stepId === step.id);
    const status = exec?.status || step.status || 'pending';

    const isRetry = isRetryStep(step);
    const nodeId = stepKey;
    stepIdToNodeId.set(stepKey, nodeId);

    const nodeData = {
      id: stepKey,
      stepId: stepKey,
      order: happySteps.length + idx + 1,
      name: humanizeName(step.name || `Fallback Step ${idx + 1}`),
      actionType: step.actionType || (isRetry ? 'retry' : 'function'),
      target: step.functionName || step.schema || step.target || 'FallbackHandler',
      inputCount: Object.keys(step.inputMapping || {}).length,
      description: step.description || null,
      retryTarget: step.retryTarget || (happySteps[0]?.stepId || 'step-001'),
      status,
      isDetailed,
      onDoubleClick: onDoubleClickStep,
    };

    nodes.push({
      id: nodeId,
      type: isRetry ? 'retryNode' : 'actionNode',
      position: { x: X_FALLBACK, y: fallbackY },
      data: nodeData,
      selected: isSelected,
    });

    fallbackY += Y_GAP;
  });

  // 4. TERMINAL NODES
  nodes.push({
    id: 'complete',
    type: 'completeNode',
    position: { x: X_CENTER, y: currentY },
    data: {
      name: 'Workflow Finished',
      subtext: 'Process terminates successfully',
    },
  });

  if (isDetailed && fallbackSteps.length > 0) {
    nodes.push({
      id: 'fallback_end',
      type: 'fallbackEndNode',
      position: { x: X_FALLBACK, y: Math.max(fallbackY, currentY - Y_GAP / 2) },
      data: {
        name: 'Cancelled / Aborted',
        subtext: 'Fail-safe cancellation complete',
      },
    });
  }

  // 5. EDGES / ROUTING CONNECTIONS

  // A. Trigger -> First Node
  if (happySteps.length > 0) {
    const firstId = happySteps[0].id || happySteps[0].stepId || 'step-001';
    edges.push({
      id: 'e-trigger-first',
      source: 'trigger',
      target: firstId,
      type: 'smoothstep',
      style: { stroke: '#a855f7', strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
    });
  }

  // B. Happy Path Connections
  for (let i = 0; i < happySteps.length; i++) {
    const curr = happySteps[i];
    const currId = curr.id || curr.stepId || `step-${i + 1}`;

    if (i < happySteps.length - 1) {
      const next = happySteps[i + 1];
      const nextId = next.id || next.stepId || `step-${i + 2}`;

      if (isDecisionStep(curr)) {
        edges.push({
          id: `e-${currId}-${nextId}-yes`,
          source: currId,
          sourceHandle: 'yes',
          target: nextId,
          type: 'smoothstep',
          label: 'YES ✓',
          labelStyle: { fill: '#4ade80', fontWeight: 800, fontSize: 11 },
          labelBgStyle: { fill: '#052e16', stroke: '#22c55e', strokeWidth: 1.5, rx: 6, ry: 6 },
          labelBgPadding: [6, 4],
          style: { stroke: '#22c55e', strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
        });
      } else {
        edges.push({
          id: `e-${currId}-${nextId}`,
          source: currId,
          target: nextId,
          type: 'smoothstep',
          style: { stroke: '#38bdf8', strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
        });
      }
    } else {
      // Final happy step -> COMPLETE
      edges.push({
        id: `e-${currId}-complete`,
        source: currId,
        target: 'complete',
        type: 'smoothstep',
        style: { stroke: '#22c55e', strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
      });
    }
  }

  // C. Fallback & Decision NO routes (Detailed Mode)
  if (isDetailed) {
    // 1. Connect Decision gates to fallback/rejection path
    const decisionStep = happySteps.find((s) => isDecisionStep(s));
    if (decisionStep) {
      const decisionId = decisionStep.id || decisionStep.stepId;
      const targetFallbackId = fallbackSteps[0]?.id || fallbackSteps[0]?.stepId || 'fallback_end';

      edges.push({
        id: `e-${decisionId}-${targetFallbackId}-no`,
        source: decisionId,
        sourceHandle: 'no',
        target: targetFallbackId,
        type: 'smoothstep',
        label: 'NO ✕ (Rejected / Unavailable)',
        labelStyle: { fill: '#fb7185', fontWeight: 800, fontSize: 11 },
        labelBgStyle: { fill: '#4c0519', stroke: '#f43f5e', strokeWidth: 1.5, rx: 6, ry: 6 },
        labelBgPadding: [6, 4],
        style: { stroke: '#f43f5e', strokeWidth: 2.5, strokeDasharray: '6,4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' },
      });
    }

    // 2. Connect steps that branch on failure (e.g. payment failure -> retry)
    const paymentStep = happySteps.find((s) => /payment|charge|transaction/i.test(s.name || ''));
    const retryStep = fallbackSteps.find((s) => isRetryStep(s));

    if (paymentStep && retryStep) {
      const paymentId = paymentStep.id || paymentStep.stepId;
      const retryId = retryStep.id || retryStep.stepId;

      edges.push({
        id: `e-${paymentId}-${retryId}-fail`,
        source: paymentId,
        target: retryId,
        type: 'smoothstep',
        label: 'ON FAILURE ✕',
        labelStyle: { fill: '#fbbf24', fontWeight: 800, fontSize: 10 },
        labelBgStyle: { fill: '#451a03', stroke: '#f59e0b', strokeWidth: 1, rx: 6, ry: 6 },
        labelBgPadding: [5, 3],
        style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
      });

      // Connect Retry Step Loop Back to Payment Step
      edges.push({
        id: `e-${retryId}-${paymentId}-loop`,
        source: retryId,
        sourceHandle: 'loop',
        target: paymentId,
        type: 'smoothstep',
        label: '↺ Retry (up to 3x)',
        labelStyle: { fill: '#facc15', fontWeight: 800, fontSize: 11 },
        labelBgStyle: { fill: '#422006', stroke: '#eab308', strokeWidth: 1.5, rx: 6, ry: 6 },
        labelBgPadding: [6, 4],
        style: { stroke: '#eab308', strokeWidth: 2.5, strokeDasharray: '4,4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#eab308' },
      });
    }

    // 3. Chain fallback steps sequentially to fallback_end
    for (let j = 0; j < fallbackSteps.length; j++) {
      const fCurr = fallbackSteps[j];
      const fCurrId = fCurr.id || fCurr.stepId || `fallback-${j + 1}`;

      if (j < fallbackSteps.length - 1) {
        const fNext = fallbackSteps[j + 1];
        const fNextId = fNext.id || fNext.stepId || `fallback-${j + 2}`;

        // Don't double wire if already wired via payment/retry
        if (!edges.some((e) => e.source === fCurrId && e.target === fNextId)) {
          edges.push({
            id: `e-${fCurrId}-${fNextId}`,
            source: fCurrId,
            target: fNextId,
            type: 'smoothstep',
            style: { stroke: '#f43f5e', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' },
          });
        }
      } else {
        // Last fallback step -> FALLBACK_END
        edges.push({
          id: `e-${fCurrId}-fallback_end`,
          source: fCurrId,
          target: 'fallback_end',
          type: 'smoothstep',
          style: { stroke: '#f43f5e', strokeWidth: 2.5, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' },
        });
      }
    }
  }

  return { nodes, edges };
}

