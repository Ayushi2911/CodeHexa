import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WorkflowBuilder from "./components/WorkflowBuilder";
import FeatureCard from "./components/FeatureCard";

import "./App.css";

function App() {
  const openBuilder = () => {
    document.getElementById("builder")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <div className="app">
      <Navbar onOpenBuilder={openBuilder} />

      <main>
        <Hero onOpenBuilder={openBuilder} />

        <WorkflowBuilder />

        <section className="features" id="features">
          <p className="tag">PLATFORM CAPABILITIES</p>

          <h2>Everything needed to build and manage workflows</h2>

          <div className="feature-grid">
            <FeatureCard
              icon="⚡"
              title="Requirement Detection"
              description="Convert natural-language business requirements into structured workflow definitions."
            />

            <FeatureCard
              icon="🔗"
              title="Visual Workflow Editing"
              description="Inspect and modify workflow steps, actions, mappings, and execution paths."
            />

            <FeatureCard
              icon="🤖"
              title="AI-Assisted Changes"
              description="Describe workflow changes in natural language and review the proposed updates."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;