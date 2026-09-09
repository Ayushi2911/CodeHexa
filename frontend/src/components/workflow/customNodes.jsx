import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export const TriggerNode = memo(({ data, selected }) => {
  return (
    <div
      className={'rf-node rf-trigger-node ' + (selected ? 'selected' : '')}
      onDoubleClick={() => data.onDoubleClick?.('trigger')}
      title="Double-click to inspect trigger event"
    >
      <div className="rf-node-pill pill-trigger">
        <span className="node-pill-dot">●</span> TRIGGER
      </div>
      <div className="rf-node-body">
        <div className="rf-node-icon-wrap trigger-glow">
          <span className="rf-icon">⚡</span>
        </div>
        <div className="rf-node-text">
          <strong className="rf-node-title">{data.name || 'Event Triggered'}</strong>
          <span className="rf-node-sub">{data.source ? 'Event: ' + data.source : 'Webhook / Form'}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="rf-handle rf-handle-bottom"
      />
    </div>
  );
});

export const ActionNode = memo(({ data, selected }) => {
  const status = data.status || 'pending';
  const actionType = (data.actionType || data.type || 'ACTION').toUpperCase();
  const stepId = data.id || data.stepId;

  return (
    <div
      className={'rf-node rf-action-node status-' + status + ' ' + (selected ? 'selected' : '')}
      onDoubleClick={() => data.onDoubleClick?.(stepId)}
      title="Double-click for quick edit • Click to select"
    >
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="rf-handle rf-handle-top"
      />
      
      <div className="rf-node-header">
        <div className="rf-node-pill pill-action">
          <span className="node-pill-icon">□</span> {actionType}
        </div>
        {data.order && <span className="rf-order-badge">#{data.order}</span>}
      </div>

      <div className="rf-node-body">
        <div className="rf-node-text">
          <strong className="rf-node-title">{data.name || 'Process Action'}</strong>
          
          {data.isDetailed && data.target && (
            <span className="rf-node-target-tag">
              Target: <code>{data.target}</code>
            </span>
          )}

          {data.isDetailed && data.inputCount > 0 && (
            <span className="rf-node-inputs-hint">
              ⇄ {data.inputCount} dynamic input{data.inputCount > 1 ? 's' : ''}
            </span>
          )}

          {!data.isDetailed && data.description && (
            <p className="rf-node-desc-short">{data.description}</p>
          )}
        </div>

        <div className="rf-status-indicator">
          {status === 'running' && <span className="spinner-small" />}
          {status === 'success' && <span className="status-check">✓</span>}
          {status === 'failed' && <span className="status-fail">✕</span>}
          {status === 'pending' && <span className="status-dot">○</span>}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="rf-handle rf-handle-bottom"
      />
    </div>
  );
});

export const DecisionNode = memo(({ data, selected }) => {
  const status = data.status || 'pending';
  const stepId = data.id || data.stepId;

  return (
    <div
      className={'rf-node rf-decision-node status-' + status + ' ' + (selected ? 'selected' : '')}
      onDoubleClick={() => data.onDoubleClick?.(stepId)}
      title="Double-click for quick edit • Click to select"
    >
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="rf-handle rf-handle-top"
      />

      <div className="rf-diamond-shape-wrapper">
        <div className="rf-node-pill pill-decision">
          <span className="node-pill-icon">◇</span> DECISION GATE
        </div>

        <div className="rf-decision-inner">
          <div className="rf-decision-header">
            <span className="rf-decision-icon">◇</span>
            {data.order && <span className="rf-order-badge">#{data.order}</span>}
          </div>

          <strong className="rf-decision-title">{data.name || 'Decision Check?'}</strong>

          {data.conditionLabel && (
            <div className="rf-condition-chip">
              <code>{data.conditionLabel}</code>
            </div>
          )}

          <div className="rf-decision-branch-labels">
            <span className="branch-pill-yes">↙ YES</span>
            <span className="branch-pill-no">NO ↘</span>
          </div>
        </div>
      </div>

      {/* YES Handle on Left Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="rf-handle rf-handle-yes"
        style={{ left: '25%' }}
      />

      {/* NO / Fallback Handle on Right Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="rf-handle rf-handle-no"
        style={{ left: '75%' }}
      />
    </div>
  );
});

export const RetryNode = memo(({ data, selected }) => {
  const status = data.status || 'pending';
  const stepId = data.id || data.stepId;

  return (
    <div
      className={'rf-node rf-retry-node status-' + status + ' ' + (selected ? 'selected' : '')}
      onDoubleClick={() => data.onDoubleClick?.(stepId)}
      title="Double-click for quick edit • Click to select"
    >
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="rf-handle rf-handle-top"
      />

      <div className="rf-node-header">
        <div className="rf-node-pill pill-retry">
          <span className="node-pill-icon">↺</span> RETRY LOOP
        </div>
        {data.order && <span className="rf-order-badge">#{data.order}</span>}
      </div>

      <div className="rf-node-body">
        <div className="rf-node-text">
          <strong className="rf-node-title">{data.name || 'Retry Handler'}</strong>
          <span className="rf-retry-sub">
            Loops back to <code>{data.retryTarget || 'Previous Step'}</code> (up to 3x)
          </span>
        </div>

        <div className="rf-status-indicator">
          {status === 'running' && <span className="spinner-small" />}
          {status === 'success' && <span className="status-check">✓</span>}
          {status === 'failed' && <span className="status-fail">✕</span>}
          {status === 'pending' && <span className="status-dot">○</span>}
        </div>
      </div>

      {/* Loop-back handle */}
      <Handle
        type="source"
        position={Position.Left}
        id="loop"
        className="rf-handle rf-handle-loop"
      />

      {/* Exhausted handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="exhausted"
        className="rf-handle rf-handle-bottom"
      />
    </div>
  );
});

export const CompleteNode = memo(({ data, selected }) => {
  return (
    <div className={'rf-node rf-complete-node ' + (selected ? 'selected' : '')}>
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="rf-handle rf-handle-top"
      />
      <div className="rf-node-pill pill-complete">
        <span className="node-pill-icon">✓</span> COMPLETE
      </div>
      <div className="rf-node-body">
        <div className="rf-node-icon-wrap complete-glow">
          <span className="rf-icon">✓</span>
        </div>
        <div className="rf-node-text">
          <strong className="rf-node-title">{data.name || 'Workflow Finished'}</strong>
          <span className="rf-node-sub">{data.subtext || 'Process terminates successfully'}</span>
        </div>
      </div>
    </div>
  );
});

export const FallbackEndNode = memo(({ data, selected }) => {
  return (
    <div className={'rf-node rf-fallback-end-node ' + (selected ? 'selected' : '')}>
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="rf-handle rf-handle-top"
      />
      <div className="rf-node-pill pill-fallback-end">
        <span className="node-pill-icon">✕</span> CANCELLED / ABORTED
      </div>
      <div className="rf-node-body">
        <div className="rf-node-icon-wrap fallback-glow">
          <span className="rf-icon">✕</span>
        </div>
        <div className="rf-node-text">
          <strong className="rf-node-title">{data.name || 'Process Terminated'}</strong>
          <span className="rf-node-sub">{data.subtext || 'Fail-safe cancellation complete'}</span>
        </div>
      </div>
    </div>
  );
});

