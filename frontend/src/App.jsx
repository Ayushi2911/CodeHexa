import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WorkflowBuilder from "./components/WorkflowBuilder";
import FeatureCard from "./components/FeatureCard";

import "./App.css";

function App() {
  const [showHistory, setShowHistory] = useState(false);

  const [executionHistory, setExecutionHistory] = useState([]);

  /*
   * =========================================================
   * CURSOR FOLLOWING AMBIENT LIGHT
   * =========================================================
   */

  useEffect(() => {
    const handleMouseMove = (event) => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${event.clientX}px`
      );

      document.documentElement.style.setProperty(
        "--mouse-y",
        `${event.clientY}px`
      );
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const openBuilder = () => {
    document
      .getElementById("builder")
      ?.scrollIntoView({
        behavior: "smooth"
      });
  };

  const openHistory = () => {
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
  };

  /*
   * =========================================================
   * RECEIVE HISTORY FROM WORKFLOW BUILDER
   * =========================================================
   */

  const handleHistoryChange = (history) => {
    setExecutionHistory(history);
  };

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <Navbar
        onOpenBuilder={openBuilder}
        onOpenHistory={openHistory}
      />


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main>

        <Hero
          onOpenBuilder={openBuilder}
        />


        <WorkflowBuilder
          onHistoryChange={
            handleHistoryChange
          }
        />


        {/* =================================================
            FEATURES
            ================================================= */}

        <section
          className="features"
          id="features"
        >

          <p className="tag">
            PLATFORM CAPABILITIES
          </p>


          <h2>
            Everything needed to build and
            manage workflows
          </h2>


          <div className="feature-grid">

            <FeatureCard
              icon="⌁"
              title="Requirement Detection"
              description="Convert natural-language business requirements into structured workflow definitions."
            />


            <FeatureCard
              icon="◈"
              title="Visual Workflow Editing"
              description="Inspect and modify workflow steps, actions, mappings, and execution paths."
            />


            <FeatureCard
              icon="✦"
              title="AI-Assisted Changes"
              description="Describe workflow changes in natural language and review the proposed updates."
            />

          </div>

        </section>

      </main>


      {/* =====================================================
          HISTORY PANEL
          ===================================================== */}

      {showHistory && (

        <div
          className="history-overlay"
          onClick={closeHistory}
        >

          <div
            className="history-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* -------------------------------------------------
                HISTORY HEADER
                ------------------------------------------------- */}

            <div className="history-panel-header">

              <div>

                <p className="tag">
                  EXECUTION HISTORY
                </p>

                <h2>
                  Workflow History
                </h2>

              </div>


              <button
                className="history-close"
                onClick={closeHistory}
                type="button"
                aria-label="Close history"
              >

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>

              </button>

            </div>


            {/* =================================================
                EMPTY HISTORY
                ================================================= */}

            {executionHistory.length === 0 && (

              <div className="history-empty">

                <div className="history-icon">

                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path
                      d="M3 12a9 9 0 1 0 3-6.7"
                    />

                    <path d="M3 4v5h5" />

                    <path d="M12 7v5l3 2" />

                  </svg>

                </div>


                <h3>
                  No workflow runs yet
                </h3>


                <p>
                  Run a workflow and its
                  execution history will
                  appear here.
                </p>

              </div>

            )}


            {/* =================================================
                HISTORY LIST
                ================================================= */}

            {executionHistory.length > 0 && (

              <div className="navbar-history-list">

                <div className="history-summary">

                  <span>
                    {executionHistory.length}{" "}
                    workflow run
                    {executionHistory.length !== 1
                      ? "s"
                      : ""}
                  </span>

                </div>


                {executionHistory.map(
                  (execution, index) => (

                    <div
                      className="navbar-history-card"
                      key={execution.id}
                    >

                      <div className="navbar-history-card-top">

                        <div>

                          <p className="history-run-number">
                            RUN #
                            {executionHistory.length -
                              index}
                          </p>


                          <h3>
                            {execution.workflowName}
                          </h3>

                        </div>


                        <span
                          className={`history-status history-${execution.status}`}
                        >
                          {execution.status}
                        </span>

                      </div>


                      <div className="navbar-history-time">

                        <span>
                          Started{" "}
                          {execution.startedAt}
                        </span>


                        {execution.completedAt && (

                          <span>
                            Completed{" "}
                            {execution.completedAt}
                          </span>

                        )}

                      </div>


                      <div className="navbar-history-steps">

                        {execution.steps.map(
                          (step) => (

                            <div
                              className="navbar-history-step"
                              key={step.stepId}
                            >

                              <span className="history-step-indicator">

                                {step.status ===
                                "success"
                                  ? "✓"
                                  : step.status ===
                                    "running"
                                  ? "●"
                                  : step.status ===
                                    "failed"
                                  ? "!"
                                  : "○"}

                              </span>


                              <span>
                                {step.stepName}
                              </span>


                              <small>
                                {step.status}
                              </small>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default App;