# CodeHexa Flow ✦
### Intelligent Prompt-to-Executable Workflow Automation Platform

> **Transform natural-language business requirements into context-aware, validated, editable, executable, and observable workflow graphs.**

---

## 📌 Overview

**CodeHexa Flow** is an enterprise-grade workflow generation and orchestration system. Unlike traditional diagram tools that generate static pictures or flowchart mockups, CodeHexa Flow bridges the gap between natural-language business requirements and actual executable code.

It analyzes requirement text against real project context (database schemas, custom cloud functions, form operations, and runtime rules), detects single or multi-chain workflows, resolves missing capabilities, validates Directed Acyclic Graph (DAG) integrity, allows human-in-the-loop AI and manual modifications, publishes versioned workflows, and executes them with live condition evaluation and audit traces.

---

## 🎯 What CodeHexa Flow Actually Does

1. **Natural-Language Understanding**: Interprets plain English business logic (e.g. *"When an order is placed, notify the vendor, create an invoice, update inventory, then send a confirmation to the customer."*).
2. **Context-Aware Action Resolution**: Matches requested steps to existing project functions (`NotifyVendorOnOrder`), schemas (`invoices`), and database operations (`inventory`). If an action does not exist (e.g. *"Fraud Verification"*), it flags it for human review rather than fabricating fake APIs.
3. **Multi-Process Disambiguation**: Intelligently separates independent business processes into distinct, modular workflows (e.g. `OrderPlaced` vs `OrderCancelled`).
4. **Structural DAG Validation**: Verifies unique step IDs, supported trigger types, schema references, input mapping dependencies, and cycle-free graph topologies before execution.
5. **Interactive Visual Studio**: Renders glowing flowchart diagrams where steps can be inspected, edited, or re-routed.
6. **Dynamic Context Passing**: Shows how step outputs dynamically feed subsequent step inputs (e.g. `amount = {{trigger.totalAmount}}`, `vendor_id = {{step-001.vendorId}}`).
7. **Conditional Execution**: Evaluates runtime conditions (e.g. `{{trigger.stock_type}} == "physical"`). If true, executes the step; if false, skips the step (amber badge) and continues down the configured graph path.
8. **AI Agent Workflow Editor (Human-in-the-Loop)**: Enables users to request modifications in natural language (e.g. *"Add an approval step before Send Confirmation"*). The AI proposes a structured before/after diff that requires explicit user approval before updating the draft.
9. **Draft-First & Versioned Publishing**: Supports `DRAFT` ➔ `VALIDATED` ➔ `PUBLISHED` states with automatic version incrementing (`v1.0`, `v2.0`).
10. **Live Execution & Observability**: Sequentially pulses through nodes (running spinner ➔ green checkmark), records execution duration in milliseconds, and persists detailed run history traces.

---

## 🔄 The Complete Processing Lifecycle

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  THE 10-STAGE CODEHEXA FLOW LIFECYCLE                                       │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                                                                             │
 │  1. DESCRIBE   ➔ User enters project name & plain-text business intent.     │
 │  2. DETECT     ➔ Engine loads project context and detects 1 or N workflows. │
 │  3. RESOLVE    ➔ Flags missing capabilities with suggestions (Review State).│
 │  4. VALIDATE   ➔ Verifies graph integrity, cycle detection, & mapping keys. │
 │  5. VISUALIZE  ➔ Interactive flowchart canvas with glowing connectors.      │
 │  6. EDIT       ➔ Manual inspector configuration & node customization.       │
 │  7. APPROVE    ➔ AI agent proposes diffs; user stays in control.           │
 │  8. PUBLISH    ➔ Promotes draft to versioned live production status.        │
 │  9. EXECUTE    ➔ Real runtime evaluation with conditional branching.        │
 │ 10. OBSERVE    ➔ Step-by-step execution traces, latency, & run logs.        │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features


### ✦ Authentication & Guest Mode Protection
- **Guest Mode Browsing**: Unauthenticated visitors can freely explore the landing page, templates, documentation, features, interactive demo, and contact form.
- **Workflow Generation Interceptor**: When a guest clicks "Generate Workflow", "Start Building", or "Use This Template", an interactive login/registration modal appears.
- **Google Sign-In & Email/Password Auth**:
  - One-click Google authentication with automated profile provisioning.
  - Custom Registration with **Full Name**, **Gmail/Email**, **Password**, **Country**, and **City/Location**.
  - Immediate resumption: Automatically resumes workflow generation upon successful authentication without losing input.
- **Navbar Profile Badge & Session State**:
  - Guest state displays `● Guest Mode` with dedicated `Log In` and `Sign Up` action buttons.
  - Logged-in state displays custom user avatar with name, location tag, and `Log Out` button.

### ✦ Intelligent Workflow Generator
- Fast animated 8-step reasoning HUD displaying active context matching.
- Multi-workflow card overview with confidence scores, validation indicators, and trigger badges.
- Recoverable guidance states for vague or underspecified business prompts.

### ✦ Visual Workflow Flowchart & Inspector
- Color-coded node badges: `TRIGGER`, `FUNCTION`, `FORM CREATE`, `OPERATION`, `APPROVAL GATE`.
- Context Passing Panel: Luminous code highlights indicating parameters reused across steps.
- Real-time diagram sync: Editing fields immediately updates the diagram without page refresh.

### ✦ AI Agent Workflow Editor (Human-in-the-Loop)
- Enter prompt: *"Add an approval step before Send Confirmation"*.
- Displays interactive Before/After Diff comparison card.
- Core Principle: **AI proposes. User approves.**

### ✦ Condition-Aware Runtime Execution
- Live Test Payload JSON editor (e.g. test with `stock_type: "physical"` vs `stock_type: "digital"`).
- Interactive execution pulses:
  - ⏳ **Running**: Blue/cyan glowing border with animated spinner.
  - ✓ **Success**: Glowing emerald green card with checkmark.
  - ⚠️ **Skipped**: Amber badge when condition evaluates to false.
  - ✕ **Failed**: Red card with error diagnostics.

### ✦ High-Fidelity "See It in Action" Demo Simulator
- Continuous interactive screen recording experience with moving cursor, smooth typing, button click ripples, interactive timeline scrubber, speed toggles (`1x`, `1.5x`, `2x`), and native **Fullscreen** mode.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Pure Modern CSS (Glassmorphism, Dark/Light Theme, Responsive Flex/Grid, Zero Layout Shifts)
- **State Management**: Reactive state hooks with zero-flicker synchronization
- **Performance**: GPU-accelerated CSS animations (`opacity`, `transform`) compliant with `prefers-reduced-motion`

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose (with offline in-memory fallback support)
- **AI Engine**: AWS Bedrock with Qwen LLM integration + Deterministic Rule-Based Fallback Parser
- **Testing**: Native Node.js test runner (`node --test`)

---

## 📁 Repository Structure

```
CodeHexa-master/
├── backend/
│   ├── config/
│   │   └── database.js               # MongoDB connection & offline handler
│   ├── controllers/
│   │   └── workflowController.js     # Detect, validate, & execute API handlers
│   ├── engine/
│   │   ├── bedrockClient.js          # AWS Bedrock LLM client & prompt templates
│   │   ├── deterministicDetector.js  # Heuristic offline intent parser
│   │   ├── workflowExecutor.js       # Runtime executor & condition evaluator
│   │   └── workflowValidator.js      # Static DAG analysis & cycle checks
│   ├── routes/
│   │   └── workflowRoutes.js         # Express REST API routes
│   ├── tests/
│   │   ├── api.test.js               # API integration tests
│   │   └── engine.test.js            # Unit tests for DAG & condition resolution
│   ├── server.js                     # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── agent/                # AI Agent diff & command components
│   │   │   ├── editor/               # Step inspector, mapping & condition editors
│   │   │   ├── execution/            # Runtime status, test payloads & run logs
│   │   │   ├── workflow/             # Flowchart diagram & node components
│   │   │   ├── AboutSection.jsx      # Architecture & platform overview
│   │   │   ├── ContactSection.jsx    # Developer support & inquiry form
│   │   │   ├── DemoVideoSection.jsx  # Interactive SaaS simulator with fullscreen
│   │   │   ├── HelpSection.jsx       # FAQs & documentation quickstart
│   │   │   ├── Hero.jsx              # Landing header & CTA
│   │   │   ├── Navbar.jsx            # Fixed navigation with smooth offset scrolling
│   │   │   ├── WorkflowBuilder.jsx   # Complete studio, generator & editor
│   │   │   ├── WorkflowInspector.jsx # Side panel for node inspection
│   │   │   └── WorkflowJsonPanel.jsx # Raw JSON schema preview & download
│   │   ├── data/
│   │   │   └── workflowGenerator.js  # Client-side multi-workflow generator
│   │   ├── services/
│   │   │   └── api.js                # Axios REST client for backend endpoints
│   │   ├── utils/
│   │   │   ├── executionHistory.js   # Run trace persistence helpers
│   │   │   ├── workflowExecutor.js   # Client-side workflow runner & pulse state
│   │   │   ├── workflowModifier.js   # AI modification graph transform engine
│   │   │   └── workflowValidator.js  # Client-side DAG validation rules
│   │   ├── App.css                   # Global stylesheet with dark/light themes
│   │   ├── App.jsx                   # Main single-page application layout
│   │   └── main.jsx                  # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** *(Optional)*: Local MongoDB instance or MongoDB Atlas URI (built-in offline fallback is active by default).

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Ayushi2911/CodeHexa.git
cd CodeHexa-master
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (optional):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codehexa
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

Start the backend server:
```bash
npm start
# Server starts on http://localhost:5000
```

#### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
# Vite dev server starts on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser to use CodeHexa Flow.

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
```bash
cd backend
npm test
```
*Executes all 7 automated unit & integration test suites (workflow detection, DAG validation, input mapping interpolation, condition resolution, and multi-chain splitting).*

### Frontend Production Build Test
```bash
cd frontend
npm run build
```
*Validates that all React components, CSS bundles, and assets compile with 0 errors.*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/workflows/detect` | Analyzes natural-language requirement and returns detected workflow graph(s). |
| `POST` | `/api/v1/workflows/validate` | Performs static DAG validation, checking cycles, schema references, and input mappings. |
| `POST` | `/api/v1/workflows/execute` | Executes a workflow against a runtime payload with condition evaluation. |
| `GET` | `/api/v1/workflows/templates` | Retrieves starter enterprise workflow templates. |
| `GET` | `/api/v1/workflows/health` | Health check endpoint for database and LLM service status. |

---

## 💡 Example Workflows

### 1. Order Processing (`OrderPlaced`)
- **Trigger**: Order Placed (`orders.created`)
- **Steps**:
  1. `Notify Vendor` (Function: `NotifyVendorOnOrder`)
  2. `Create Invoice` (Form Create: `invoices.insert`)
  3. `Update Inventory` (Operation: `inventory.deduct` | *Condition: `stock_type == "physical"`*)
  4. `Send Confirmation` (Function: `SendOrderConfirmation`)

### 2. Complaint Processing (`ComplaintReceived` - PS11)
- **Trigger**: Complaint Received (`crm_portal`)
- **Steps**:
  1. `Log Complaint` (Form Create: `complaintSchema`)
  2. `Check Anomaly & Warranty` (Function: `diagnoseComplaint`)
  3. `Notify Customer & Resolution` (Form Create: `sendNotification`)

### 3. Job Application Flow (`JobApplication`)
- **Trigger**: Application Submitted (`careers_portal`)
- **Steps**:
  1. `Screen Resume & Report Applicant` (Form Create: `applicationSchema`)
  2. `Interview & Offer Negotiation` (Function: `conductInterview`)
  3. `Probation Performance Review` (Function: `reviewProbation`)

---

## 👥 Contributors & Credits
- **Project**: CodeHexa Flow
- **Developed by**: College Students
- **Repository**: [CodeHexa on GitHub](https://github.com/Ayushi2911/CodeHexa)
