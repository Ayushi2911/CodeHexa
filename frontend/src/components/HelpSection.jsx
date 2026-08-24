import { useState } from "react";

function HelpSection() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How does CodeHexa Flow convert text into a workflow?",
      a: "CodeHexa Flow uses a hybrid engine combining rule-based deterministic parsing with AWS Bedrock Qwen LLMs. It scans your prompt for triggers (e.g. 'When an order is created'), intermediate actions ('generate PDF invoice'), and final functions ('send confirmation email'), mapping variables and dependency edges automatically.",
    },
    {
      q: "What validation checks are performed on workflows?",
      a: "The engine runs 4 core validation passes: 1) Trigger uniqueness (ensuring exactly one valid trigger), 2) Circular dependency and cycle detection (preventing infinite loops), 3) Input mapping resolution (verifying all required keys exist), and 4) Condition syntax validity.",
    },
    {
      q: "Can I edit or customize steps after AI generates them?",
      a: "Yes! You can either use the AI Workflow Editor command bar to request natural-language adjustments ('Add an approval step before payment'), or click on any step in the Visual Workflow Inspector to customize its name, action type, input template, and execution conditions manually.",
    },
    {
      q: "How do I export and deploy my workflows?",
      a: "You can download your entire workflow as a structured JSON file at any time with the 'Download JSON' button, or integrate it with the CodeHexa Backend REST API endpoints (/api/v1/workflows/execute) for continuous orchestration in your application.",
    },
    {
      q: "Does CodeHexa Flow work offline or with cloud models?",
      a: "Both! CodeHexa Flow includes a built-in deterministic heuristic engine that functions 100% offline without any external API keys, while also supporting AWS Bedrock Qwen models for advanced multi-step reasoning when connected.",
    },
  ];

  const quicksteps = [
    {
      step: "01",
      title: "Enter Requirement",
      desc: "Describe your workflow in everyday English in the Requirement Box or select a starter template.",
    },
    {
      step: "02",
      title: "Generate & Inspect",
      desc: "Click 'Generate Workflow' to let the AI build the structured graph, trigger, and action steps.",
    },
    {
      step: "03",
      title: "Validate & Modify",
      desc: "Run instant validation to catch errors or use the AI editor to add approval gates and notifications.",
    },
    {
      step: "04",
      title: "Execute & Export",
      desc: "Simulate live workflow runs with real-time logs and download the production-ready JSON schema.",
    },
  ];

  return (
    <section className="help-section" id="help">
      <div className="help-header">
        <div className="features-eyebrow">
          <span className="features-eyebrow-dot" />
          HELP & DOCUMENTATION
        </div>

        <h2>Everything you need to master CodeHexa Flow</h2>

        <p className="help-subtitle">
          Explore our quickstart walkthrough, interactive FAQs, and core concepts to build dependable automations in minutes.
        </p>
      </div>

      <div className="quickstart-grid">
        {quicksteps.map((qs, i) => (
          <div className="quickstart-card" key={i}>
            <div className="qs-number">{qs.step}</div>
            <h4>{qs.title}</h4>
            <p>{qs.desc}</p>
          </div>
        ))}
      </div>

      <div className="faq-container">
        <div className="faq-header-row">
          <h3>Frequently Asked Questions</h3>
          <span>Click any question to view the full explanation</span>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className={`faq-item ${isOpen ? "faq-open" : ""}`}
                onClick={() => setOpenFaq(isOpen ? -1 : index)}
              >
                <button type="button" className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-toggle-icon">{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HelpSection;
