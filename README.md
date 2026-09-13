# CodeHexa Flow ✦

### Intelligent Prompt-to-Executable Workflow Automation Platform

> **Transform natural-language business requirements into context-aware, validated, editable, executable, and observable workflow graphs.**

---

## 📌 Overview

**CodeHexa Flow** is an intelligent workflow generation and orchestration platform that converts natural-language business requirements into structured and executable workflow graphs.

Instead of creating only static flowcharts, CodeHexa Flow analyzes a user's requirement, identifies workflow steps, conditions, dependencies, and actions, and presents them through an interactive workflow studio.

Users can review and modify generated workflows, validate their structure, test execution conditions, publish workflow versions, and observe execution results.

The platform follows a **human-in-the-loop approach**, where AI assists with workflow generation and modification while the user remains in control of final changes.

---

## 🎯 What CodeHexa Flow Does

1. **Natural-Language Understanding**
   Interprets plain-English business requirements and converts them into structured workflow logic.

2. **Context-Aware Action Resolution**
   Matches requested workflow actions with available project functions, schemas, and database operations.

3. **Multi-Workflow Detection**
   Identifies and separates independent processes when a requirement contains multiple business workflows.

4. **Workflow Validation**
   Checks workflow structure, step IDs, dependencies, mappings, and graph integrity before execution.

5. **Interactive Workflow Visualization**
   Converts generated workflow data into an editable visual flowchart.

6. **Dynamic Context Passing**
   Shows how values from triggers and previous steps can be passed into subsequent workflow steps.

7. **Conditional Execution**
   Supports conditions that determine whether individual workflow steps should execute or be skipped.

8. **AI-Assisted Workflow Modification**
   Allows users to request workflow changes using natural language while keeping the user in control of the final modification.

9. **Draft-First Workflow Management**
   Workflows can be created, reviewed, validated, and published through controlled states.

10. **Workflow Execution & Observability**
    Provides runtime execution states, step-level results, execution duration, and run history.

11. **Data Export**
    Allows users to export relevant workflow/application data for external use and record keeping.

---

## 🔄 Complete CodeHexa Flow Lifecycle

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE CODEHEXA FLOW LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. DESCRIBE   ➔ Enter project and natural-language business intent.        │
│  2. DETECT     ➔ Analyze the requirement and identify workflow(s).          │
│  3. RESOLVE    ➔ Match actions with available project context.              │
│  4. VALIDATE   ➔ Check dependencies, mappings, graph structure & rules.     │
│  5. VISUALIZE  ➔ Generate an interactive workflow diagram.                  │
│  6. EDIT       ➔ Modify workflow steps manually or with AI assistance.      │
│  7. APPROVE    ➔ Review AI-proposed workflow changes.                       │
│  8. PUBLISH    ➔ Publish a validated workflow version.                      │
│  9. EXECUTE    ➔ Run the workflow with runtime condition evaluation.        │
│ 10. OBSERVE    ➔ Review execution status, timing and run history.           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 🚀 Key Features

## ✦ Authentication & Guest Mode

CodeHexa Flow supports both authenticated and guest experiences.

### Guest Mode

Unauthenticated users can explore the public-facing application experience and are prompted to authenticate when attempting to access protected workflow functionality.

### Authentication

* Google Sign-In
* Email/password registration
* User profile provisioning
* Session state management
* Login and registration modal
* Protected workflow-generation actions

### User Session

When logged in, users can access their profile and application settings through the authenticated interface.

---

## ✦ Intelligent Workflow Generator

The **Workflow Generator** is the core functionality of CodeHexa Flow.

It:

* Accepts natural-language business requirements.
* Detects workflow intent.
* Identifies triggers and actions.
* Detects conditions and dependencies.
* Supports multiple workflow chains.
* Produces structured workflow data.
* Provides validation information.
* Handles incomplete or vague requirements with guidance.
* Provides an improved and more reliable workflow-generation experience.

---

## ✦ Interactive Workflow Studio

Generated workflows are displayed in an interactive visual editor.

Users can:

* View workflow steps.
* Inspect individual nodes.
* Edit workflow properties.
* Change step configurations.
* Modify conditions.
* Review input/output mappings.
* Re-route workflow connections.
* Synchronize diagram changes with workflow data.

### Supported Node Types

* `TRIGGER`
* `FUNCTION`
* `FORM CREATE`
* `OPERATION`
* `APPROVAL GATE`

---

## ✦ AI Workflow Editor

CodeHexa Flow follows a **Human-in-the-Loop** workflow modification model.

For example:

> "Add an approval step before Send Confirmation."

The system can propose the modification for the user to review before applying it.

### Principle

```text
AI proposes
     ↓
User reviews
     ↓
User approves
     ↓
Workflow is updated
```

This keeps the user in control of AI-assisted workflow changes.

---

## ✦ Workflow Validation

Before execution or publishing, workflows can be validated against structural rules.

Validation includes:

* Unique step IDs
* Valid trigger types
* Supported node types
* Dependency checks
* Input mapping validation
* Schema references
* Graph integrity
* Cycle detection
* Condition configuration

This helps prevent invalid workflow structures from being executed.

---

## ✦ Condition-Aware Runtime Execution

CodeHexa Flow supports runtime conditions.

For example:

```text
stock_type == "physical"
```

If the condition evaluates to **true**, the associated step executes.

If the condition evaluates to **false**, the step is skipped and execution continues according to the configured workflow path.

### Runtime States

* ⏳ **Running**
* ✓ **Success**
* ⚠️ **Skipped**
* ✕ **Failed**

Execution results can include step-level status and timing information.

---

## ✦ Workflow History & Observability

Workflow execution information can be recorded for later review.

Users can inspect:

* Previous workflow runs
* Step execution status
* Execution duration
* Successful steps
* Skipped steps
* Failed steps
* Runtime traces

This provides visibility into workflow execution and helps users understand what happened during each run.

---

## ✦ Export Data

CodeHexa Flow includes an **Export Data** capability that allows users to export relevant application and workflow data.

This can be used to:

* Keep external records.
* Share workflow information.
* Maintain backups.
* Use exported information outside the application.

---

# ⚙️ Settings

A dedicated **Settings** page has been added to organize application and user-related options in one place.

The Settings section provides access to relevant controls without overcrowding the primary workflow navigation.

### Settings provides access to:

* User and application settings
* About
* Contact
* Help
* Data export
* Other available application controls

The informational sections have been moved away from the primary workflow navigation so that the main interface remains focused on the core workflow experience.

---

# 🎨 UI/UX Improvements

The latest version includes several improvements to the overall application interface and user experience.

### Improvements include:

* Dedicated Settings page
* Cleaner navigation structure
* Reduced main-navigation clutter
* Improved spacing and alignment
* Better workflow editor presentation
* Improved cards and panels
* Dark/light theme support
* Better visual hierarchy
* Improved workflow interaction
* Responsive layouts
* Smoother animations and transitions
* More consistent buttons and controls
* Improved overall application polish

The interface follows a modern SaaS-style design with workflow-focused visual elements, responsive layouts, and a consistent application theme.

---

# 🧭 Application Structure

The application is centered around the workflow-building experience.

### Main Workflow Flow

```text
Home
  ↓
Workflow
  ↓
Workflow Studio
  ↓
Validate
  ↓
Publish
  ↓
Execute
  ↓
History / Observability
```

Additional informational and account-related sections are accessible through **Settings**, keeping the primary navigation focused on workflow operations.

---

# 🛠️ Tech Stack & Architecture

## Frontend

* **Framework:** React 18
* **Build Tool:** Vite
* **Styling:** Modern CSS
* **UI:** Responsive Flexbox/Grid layouts
* **Theme:** Dark/Light mode
* **State Management:** React Hooks
* **Animations:** GPU-friendly CSS animations
* **Workflow Visualization:** Interactive React-based workflow components

## Backend

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose
* **Offline Support:** In-memory fallback
* **AI Engine:** AWS Bedrock with Qwen LLM integration
* **Fallback:** Deterministic rule-based workflow parser
* **Testing:** Native Node.js test runner

---

# 📁 Repository Structure

```text
CodeHexa-master/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   └── workflowController.js
│   │
│   ├── engine/
│   │   ├── bedrockClient.js
│   │   ├── deterministicDetector.js
│   │   ├── workflowExecutor.js
│   │   └── workflowValidator.js
│   │
│   ├── routes/
│   │   └── workflowRoutes.js
│   │
│   ├── tests/
│   │   ├── api.test.js
│   │   └── engine.test.js
│   │
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── agent/
│   │   │   ├── editor/
│   │   │   ├── execution/
│   │   │   ├── workflow/
│   │   │   ├── auth/
│   │   │   ├── AboutSection.jsx
│   │   │   ├── ContactSection.jsx
│   │   │   ├── HelpSection.jsx
│   │   │   ├── DemoVideoSection.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── WorkflowBuilder.jsx
│   │   │   ├── WorkflowInspector.jsx
│   │   │   └── WorkflowJsonPanel.jsx
│   │   │
│   │   ├── data/
│   │   │   └── workflowGenerator.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── utils/
│   │   │   ├── executionHistory.js
│   │   │   ├── workflowExecutor.js
│   │   │   ├── workflowModifier.js
│   │   │   └── workflowValidator.js
│   │   │
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

# ⚡ Getting Started

## Prerequisites

* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** Optional — local MongoDB or MongoDB Atlas

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ayushi2911/CodeHexa.git
cd CodeHexa-master
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` if required:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codehexa
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

Start the backend:

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Testing

## Backend Tests

```bash
cd backend
npm test
```

Tests cover workflow-related functionality including:

* Workflow detection
* DAG validation
* Input mapping
* Condition resolution
* Multi-workflow splitting
* API behavior

## Frontend Production Build

```bash
cd frontend
npm run build
```

This verifies that the React/Vite application builds successfully.

---

# 📡 REST API

| Method | Endpoint                      | Description                                                  |
| ------ | ----------------------------- | ------------------------------------------------------------ |
| `POST` | `/api/v1/workflows/detect`    | Detects workflow graph(s) from natural-language requirements |
| `POST` | `/api/v1/workflows/validate`  | Validates workflow structure                                 |
| `POST` | `/api/v1/workflows/execute`   | Executes a workflow with runtime conditions                  |
| `GET`  | `/api/v1/workflows/templates` | Retrieves workflow templates                                 |
| `GET`  | `/api/v1/workflows/health`    | Checks backend/database/AI service status                    |

---

# 💡 Example Workflows

## 1. Order Processing

**Trigger:** Order Placed (`orders.created`)

```text
Order Placed
     ↓
Notify Vendor
     ↓
Create Invoice
     ↓
Update Inventory
     ↓
Send Confirmation
```

Conditional inventory handling can be applied based on the order type.

---

## 2. Complaint Processing

**Trigger:** Complaint Received (`crm_portal`)

```text
Complaint Received
        ↓
Log Complaint
        ↓
Check Anomaly & Warranty
        ↓
Notify Customer
        ↓
Resolution
```

---

## 3. Job Application Flow

**Trigger:** Application Submitted (`careers_portal`)

```text
Application Submitted
        ↓
Screen Resume
        ↓
Interview
        ↓
Offer Negotiation
        ↓
Probation Review
```

---

# 🔐 Human-in-the-Loop Philosophy

CodeHexa Flow is designed around the principle:

> **AI assists. Humans decide.**

AI helps understand requirements and propose workflow modifications, while users retain control over important workflow changes.

This approach combines automation with human review and transparency.

---

# 📊 Core Value Proposition

Traditional workflow tools often focus on manually creating diagrams.

CodeHexa Flow aims to provide a complete workflow lifecycle:

```text
Natural Language
       ↓
Workflow Detection
       ↓
Context Resolution
       ↓
Validation
       ↓
Visual Editing
       ↓
Human Approval
       ↓
Publishing
       ↓
Execution
       ↓
Monitoring
       ↓
Export / History
```

The goal is to move from **"drawing a workflow"** to **"understanding, validating, managing, and executing a workflow."**

---

# 👥 Contributors & Credits

* **Project:** CodeHexa Flow
* **Problem Statement:** SIH 2026 PS11 – Business Workflow Detection and Diagram Generation
* **Team:** CodeHexa
* **Team ID:** T14
* **Developed by:** College Student Team

---

# ✦ CodeHexa Flow

**Describe → Detect → Resolve → Validate → Edit → Approve → Publish → Execute → Observe**

> **From business language to executable workflow.**
