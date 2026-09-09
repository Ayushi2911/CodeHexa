import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
} from '@xyflow/react';

import {
  TriggerNode,
  ActionNode,
  DecisionNode,
  RetryNode,
  CompleteNode,
  FallbackEndNode,
} from './customNodes';
import { buildGraphFromWorkflow } from './graphLayoutEngine';

const NODE_TYPES = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  decisionNode: DecisionNode,
  retryNode: RetryNode,
  completeNode: CompleteNode,
  fallbackEndNode: FallbackEndNode,
};

function WorkflowDiagram({
  workflow,
  executionState = [],
  selectedStepId,
  onSelectStep,
  onUpdateStep,
  onAddStep,
  onDeleteStep,
  onWorkflowChange,
  isFullscreen = false,
  onToggleFullscreen,
}) {
  const [isDetailed, setIsDetailed] = useState(true);
  const [editingStep, setEditingStep] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', target: '', actionType: 'function' });
  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  // Handle double-click step edit modal
  const handleDoubleClickStep = useCallback(
    (stepId) => {
      if (!workflow || !workflow.steps) return;
      if (stepId === 'trigger') return;
      const target = workflow.steps.find((s) => (s.id || s.stepId) === stepId);
      if (target) {
        setEditingStep(target);
        setEditFormData({
          name: target.name || '',
          target: target.target || target.functionName || target.schema || '',
          actionType: target.actionType || target.type || 'function',
        });
      }
    },
    [workflow]
  );

  // Build initial nodes and edges from workflow state
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!workflow) return { initialNodes: [], initialEdges: [] };
    const graph = buildGraphFromWorkflow(workflow, {
      isDetailed,
      executionState,
      selectedStepId,
      onDoubleClickStep: handleDoubleClickStep,
    });
    return { initialNodes: graph.nodes, initialEdges: graph.edges };
  }, [workflow, isDetailed, executionState, selectedStepId, handleDoubleClickStep]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync graph whenever workflow, detail toggle, or selection changes
  useEffect(() => {
    if (!workflow) return;
    const graph = buildGraphFromWorkflow(workflow, {
      isDetailed,
      executionState,
      selectedStepId,
      onDoubleClickStep: handleDoubleClickStep,
    });
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [workflow, isDetailed, executionState, selectedStepId, handleDoubleClickStep, setNodes, setEdges]);

  // Node selection callback
  const onNodeClick = useCallback(
    (_, node) => {
      if (node.id === 'trigger' || node.id === 'complete' || node.id === 'fallback_end') {
        if (onSelectStep) onSelectStep(null);
        return;
      }
      if (onSelectStep) {
        onSelectStep(node.id);
      }
    },
    [onSelectStep]
  );

  // Edge connection handler for direct visual wiring
  const onConnect = useCallback(
    (params) => {
      const { source, target, sourceHandle } = params;
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: sourceHandle === 'no' ? '#f43f5e' : '#22c55e', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: sourceHandle === 'no' ? '#f43f5e' : '#22c55e',
            },
          },
          eds
        )
      );

      // Propagate connection update to workflow model
      if (workflow && workflow.steps && onUpdateStep) {
        const sourceStep = workflow.steps.find((s) => (s.id || s.stepId) === source);
        if (sourceStep) {
          if (sourceHandle === 'no' || sourceHandle === 'exhausted') {
            onUpdateStep({ ...sourceStep, onFailure: target });
          } else if (sourceHandle === 'loop') {
            onUpdateStep({ ...sourceStep, retryTarget: target });
          } else {
            onUpdateStep({ ...sourceStep, onSuccess: target });
          }
        }
      }
    },
    [setEdges, workflow, onUpdateStep]
  );

  // Auto layout reset
  const handleAutoLayout = useCallback(() => {
    if (!workflow) return;
    const graph = buildGraphFromWorkflow(workflow, {
      isDetailed,
      executionState,
      selectedStepId,
      onDoubleClickStep: handleDoubleClickStep,
    });
    setNodes(graph.nodes);
    setEdges(graph.edges);
    if (rfInstance) {
      setTimeout(() => rfInstance.fitView({ padding: 0.2, duration: 400 }), 50);
    }
  }, [workflow, isDetailed, executionState, selectedStepId, handleDoubleClickStep, setNodes, setEdges, rfInstance]);

  // Add Step Palette Actions
  const handleAddAction = (type) => {
    if (!workflow) return;
    const currentSteps = workflow.steps || [];
    const newIdx = currentSteps.length + 1;
    const stepId = `step-${String(newIdx).padStart(3, '0')}`;

    let newStep = {
      id: stepId,
      stepId: stepId,
      name: `New Action ${newIdx}`,
      actionType: 'function',
      target: 'ExecuteTask',
      inputMapping: {},
      onSuccess: 'next',
      onFailure: 'abort',
    };

    if (type === 'decision') {
      newStep = {
        id: stepId,
        stepId: stepId,
        name: `Validate Check ${newIdx}?`,
        actionType: 'decision',
        condition: { field: '{{trigger.status}}', operator: 'eq', value: 'true' },
        onSuccess: 'next',
        onFailure: 'abort',
      };
    } else if (type === 'retry') {
      const prevStepId = currentSteps[currentSteps.length - 1]?.id || currentSteps[0]?.id || 'step-001';
      newStep = {
        id: stepId,
        stepId: stepId,
        name: `Retry Previous Step`,
        actionType: 'retry',
        retryTarget: prevStepId,
        inputMapping: { maxRetries: 3 },
        onSuccess: 'next',
        onFailure: 'abort',
      };
    }

    if (onAddStep) {
      onAddStep(newStep);
    } else if (onWorkflowChange) {
      onWorkflowChange({
        ...workflow,
        steps: [...currentSteps, newStep],
      });
    }
  };

  // Quick edit save
  const handleSaveQuickEdit = (e) => {
    e.preventDefault();
    if (!editingStep || !onUpdateStep) return;
    onUpdateStep({
      ...editingStep,
      name: editFormData.name,
      target: editFormData.target,
      functionName: editFormData.actionType === 'function' ? editFormData.target : editingStep.functionName,
      schema: ['formCreate', 'formUpdate', 'formDelete'].includes(editFormData.actionType)
        ? editFormData.target
        : editingStep.schema,
      actionType: editFormData.actionType,
    });
    setEditingStep(null);
  };

  if (!workflow) {
    return (
      <div className="workflow-diagram empty-diagram">
        <p>No workflow generated yet.</p>
      </div>
    );
  }

  return (
    <div
      className={`workflow-flow-container ${isFullscreen ? 'flow-fullscreen-mode' : ''}`}
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={1.6}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(124, 92, 255, 0.12)" gap={20} size={1.5} />
        <Controls showInteractive={false} className="rf-custom-controls" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="rf-custom-minimap"
          maskColor="rgba(15, 23, 42, 0.75)"
        />

        {/* TOP TOOLBAR PANEL */}
        <Panel position="top-left" className="rf-canvas-toolbar-panel">
          <div className="view-mode-toggle-group">
            <button
              type="button"
              className={`view-mode-btn ${!isDetailed ? 'active' : ''}`}
              onClick={() => setIsDetailed(false)}
              title="Basic View: High-level primary sequential flow"
            >
              ✦ Basic View
            </button>
            <button
              type="button"
              className={`view-mode-btn ${isDetailed ? 'active' : ''}`}
              onClick={() => setIsDetailed(true)}
              title="Detailed View: Real-world logic with decisions, retries & fallbacks"
            >
              ⚡ Detailed View
            </button>
          </div>

          <div className="canvas-step-palette">
            <button
              type="button"
              className="palette-btn palette-btn-action"
              onClick={() => handleAddAction('action')}
              title="Add regular action step"
            >
              + Action
            </button>
            <button
              type="button"
              className="palette-btn palette-btn-decision"
              onClick={() => handleAddAction('decision')}
              title="Add decision gate (YES / NO branch)"
            >
              + Decision Gate
            </button>
            <button
              type="button"
              className="palette-btn palette-btn-retry"
              onClick={() => handleAddAction('retry')}
              title="Add retry loop back to previous step"
            >
              ↺ Retry Loop
            </button>
          </div>

          <div className="canvas-action-tools">
            <button
              type="button"
              className="tool-icon-btn"
              onClick={handleAutoLayout}
              title="Auto-organize flowchart layout"
            >
              ⟲ Auto Layout
            </button>
            {onToggleFullscreen && (
              <button
                type="button"
                className="tool-icon-btn"
                onClick={onToggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
              >
                {isFullscreen ? '✕ Exit Fullscreen' : '⛶ Fullscreen'}
              </button>
            )}
          </div>
        </Panel>

        {/* BOTTOM HINT PANEL */}
        <Panel position="bottom-center" className="rf-canvas-hint-panel">
          <span className="rf-hint-pill">
            💡 Tip: <strong>Click</strong> to inspect • <strong>Double-click</strong> to quick-edit • <strong>Drag handles</strong> to wire paths
          </span>
        </Panel>
      </ReactFlow>

      {/* INLINE QUICK STEP EDITOR MODAL */}
      {editingStep && (
        <div className="inline-quick-modal-backdrop" onClick={() => setEditingStep(null)}>
          <div className="inline-quick-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quick-modal-header">
              <span className="quick-modal-badge">QUICK EDIT STEP</span>
              <h4>{editingStep.name || 'Edit Step'}</h4>
              <button
                type="button"
                className="quick-modal-close"
                onClick={() => setEditingStep(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="quick-modal-body">
              <div className="quick-field">
                <label>Step Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Step label"
                  autoFocus
                  required
                />
              </div>

              <div className="quick-field">
                <label>Step Type</label>
                <select
                  value={editFormData.actionType}
                  onChange={(e) => setEditFormData({ ...editFormData, actionType: e.target.value })}
                >
                  <option value="function">Function / Custom Logic</option>
                  <option value="formCreate">Form Create / Insert Record</option>
                  <option value="formUpdate">Form Update / Patch Status</option>
                  <option value="decision">Decision Gate (YES / NO)</option>
                  <option value="retry">Retry Loop</option>
                  <option value="operation">UI Form Button Operation</option>
                </select>
              </div>

              <div className="quick-field">
                <label>Target Capability / Schema / Function</label>
                <input
                  type="text"
                  value={editFormData.target}
                  onChange={(e) => setEditFormData({ ...editFormData, target: e.target.value })}
                  placeholder="e.g. ProcessPayment or invoices"
                />
              </div>

              <div className="quick-modal-actions">
                {onDeleteStep && (
                  <button
                    type="button"
                    className="quick-modal-delete-btn"
                    onClick={() => {
                      onDeleteStep(editingStep.id || editingStep.stepId);
                      setEditingStep(null);
                    }}
                  >
                    Delete Step
                  </button>
                )}
                <button
                  type="button"
                  className="quick-modal-cancel-btn"
                  onClick={() => setEditingStep(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="quick-modal-save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowDiagram;

