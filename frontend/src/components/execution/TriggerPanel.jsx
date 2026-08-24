function TriggerPanel({
  workflow,
  onTriggerChange,
}) {
  if (!workflow) {
    return (
      <div className="trigger-panel">
        <h3>Workflow Trigger</h3>
        <p>No workflow loaded.</p>
      </div>
    );
  }

  const trigger = workflow.trigger || {};

  const handleChange = (field, value) => {
    if (!onTriggerChange) {
      return;
    }

    onTriggerChange({
      ...trigger,
      [field]: value,
    });
  };

  return (
    <div className="trigger-panel">
      <div className="trigger-panel-header">
        <div>
          <h3>⚡ Workflow Trigger</h3>
          <p>Configure how this workflow starts.</p>
        </div>

        <span className="trigger-badge">
          TRIGGER
        </span>
      </div>

      <label>
        Trigger Name

        <input
          type="text"
          value={trigger.name || ""}
          onChange={(event) =>
            handleChange(
              "name",
              event.target.value
            )
          }
          placeholder="Example: Order Created"
        />
      </label>

      <label>
        Trigger Type

        <select
          value={trigger.type || "manual"}
          onChange={(event) =>
            handleChange(
              "type",
              event.target.value
            )
          }
        >
          <option value="manual">
            Manual
          </option>

          <option value="event">
            Event
          </option>

          <option value="webhook">
            Webhook
          </option>

          <option value="schedule">
            Schedule
          </option>
        </select>
      </label>

      <div className="trigger-preview">
        <span>Current Trigger</span>

        <strong>
          {trigger.name || "Unnamed Trigger"}
        </strong>

        <small>
          Type: {trigger.type || "manual"}
        </small>
      </div>
    </div>
  );
}

export default TriggerPanel;
