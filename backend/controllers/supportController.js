const mongoose = require("mongoose");
const ContactMessage = require("../models/ContactMessage");

// In-memory messages store for local sandbox/testing fallback
const inMemoryMessages = [];

const DEFAULT_FAQS = [
  {
    id: "faq-1",
    question: "What is CodeHexa Flow and how does it automate business workflows?",
    answer: "CodeHexa Flow is an enterprise visual workflow automation platform that detects business logic from requirements, creates validated Directed Acyclic Graphs (DAGs), and orchestrates tasks with sub-millisecond execution.",
    category: "general",
  },
  {
    id: "faq-2",
    question: "How does the AWS Bedrock AI integration work?",
    answer: "CodeHexa Flow uses AWS Bedrock Qwen and multimodal intelligence to parse natural language specifications, detect branching conditions, and construct executable workflow JSON topologies.",
    category: "ai",
  },
  {
    id: "faq-3",
    question: "What happens to deleted workflows and how long is trash retained?",
    answer: "Deleted workflows are moved to the Trash bin for safe recovery. By default, workflows are stored in Trash for 30 days before scheduled permanent removal, and can be restored or exported at any time.",
    category: "data",
  },
  {
    id: "faq-4",
    question: "Can I export and import workflow configurations across workspaces?",
    answer: "Yes. CodeHexa Flow supports one-click JSON exporting and batch importing from Settings → Data & Storage as well as individual workflow cards.",
    category: "workflow",
  },
];

const DEFAULT_DOCS = [
  {
    id: "doc-1",
    title: "Quickstart Onboarding Guide",
    description: "Learn how to prompt, design, and validate your first workflow in under 3 minutes.",
    category: "guides",
  },
  {
    id: "doc-2",
    title: "Visual DAG Node Types & Action Handlers",
    description: "Detailed documentation on Function, Form Create/Update/Delete, and Operation nodes.",
    category: "architecture",
  },
  {
    id: "doc-3",
    title: "Conditions, Dynamic Mapping & Expression Engine",
    description: "Guide on data mapping templates (e.g. {{trigger.id}}) and rule evaluation operators.",
    category: "advanced",
  },
];

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Submit a Contact Message or Support Inquiry
 * POST /api/support/contact
 */
async function submitContact(req, res) {
  try {
    const { name, email, category = "general", subject = "", message, userEmail, priority = "medium" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, error: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ ok: false, error: "Email is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ ok: false, error: "Message content is required" });
    }

    const newRecord = {
      _id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category: category || "general",
      subject: (subject || "").trim() || `${category.toUpperCase()} Inquiry from ${name.trim()}`,
      message: message.trim(),
      status: "open",
      priority: priority || "medium",
      userEmail: (userEmail || email).trim().toLowerCase(),
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        const savedDoc = await ContactMessage.create({
          name: newRecord.name,
          email: newRecord.email,
          category: newRecord.category,
          subject: newRecord.subject,
          message: newRecord.message,
          status: newRecord.status,
          priority: newRecord.priority,
          userEmail: newRecord.userEmail,
          ipAddress: newRecord.ipAddress,
        });
        newRecord._id = savedDoc._id.toString();
      } catch (dbErr) {
        console.warn("MongoDB ContactMessage.create note:", dbErr.message);
      }
    }

    inMemoryMessages.unshift(newRecord);
    if (inMemoryMessages.length > 200) {
      inMemoryMessages.pop();
    }

    return res.status(201).json({
      ok: true,
      message: "Your message has been received! Our support team will respond within 24 hours.",
      data: newRecord,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * Submit a dedicated Problem / Support Ticket
 * POST /api/support/ticket
 */
async function submitTicket(req, res) {
  try {
    const {
      title,
      subject,
      description,
      message,
      email,
      userEmail,
      severity = "medium",
      category = "support",
      stepsToReproduce = "",
    } = req.body;

    const ticketSubject = subject || title || "Problem Report";
    const ticketMessage = description || message || stepsToReproduce || "No detailed description provided.";
    const ticketEmail = userEmail || email || "anonymous@codehexa.com";

    if (!ticketMessage || !ticketMessage.trim()) {
      return res.status(400).json({ ok: false, error: "Problem description is required." });
    }

    const newTicket = {
      _id: `tkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: (ticketEmail.split("@")[0] || "User").replace(/[._-]/g, " "),
      email: ticketEmail.trim().toLowerCase(),
      category: category || "bug_report",
      subject: ticketSubject.trim(),
      message: ticketMessage.trim(),
      status: "open",
      priority: severity === "critical" ? "urgent" : (severity === "high" ? "high" : "medium"),
      userEmail: ticketEmail.trim().toLowerCase(),
      metadata: { stepsToReproduce, severity },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        const savedDoc = await ContactMessage.create({
          name: newTicket.name,
          email: newTicket.email,
          category: newTicket.category,
          subject: newTicket.subject,
          message: newTicket.message,
          status: newTicket.status,
          priority: newTicket.priority,
          userEmail: newTicket.userEmail,
          metadata: newTicket.metadata,
        });
        newTicket._id = savedDoc._id.toString();
      } catch (dbErr) {
        console.warn("MongoDB ticket creation note:", dbErr.message);
      }
    }

    inMemoryMessages.unshift(newTicket);

    return res.status(201).json({
      ok: true,
      message: "Support ticket registered successfully.",
      ticketId: newTicket._id,
      data: newTicket,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * List support messages / tickets
 * GET /api/support/messages
 */
async function getMessages(req, res) {
  try {
    const { userEmail, status } = req.query;

    if (isDbConnected()) {
      try {
        const filter = {};
        if (userEmail) filter.userEmail = userEmail.toLowerCase();
        if (status) filter.status = status;
        const docs = await ContactMessage.find(filter).sort({ createdAt: -1 }).limit(100).lean();
        return res.json({ ok: true, count: docs.length, data: docs });
      } catch (dbErr) {
        console.warn("MongoDB getMessages note:", dbErr.message);
      }
    }

    let results = inMemoryMessages;
    if (userEmail) {
      results = results.filter((m) => m.userEmail === userEmail.toLowerCase());
    }
    if (status) {
      results = results.filter((m) => m.status === status);
    }

    return res.json({ ok: true, count: results.length, data: results });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * List FAQs
 * GET /api/support/faqs
 */
function getFaqs(req, res) {
  return res.json({ ok: true, count: DEFAULT_FAQS.length, data: DEFAULT_FAQS });
}

/**
 * List Quickstart Docs
 * GET /api/support/docs
 */
function getDocs(req, res) {
  return res.json({ ok: true, count: DEFAULT_DOCS.length, data: DEFAULT_DOCS });
}

module.exports = {
  submitContact,
  submitTicket,
  getMessages,
  getFaqs,
  getDocs,
  inMemoryMessages,
};
