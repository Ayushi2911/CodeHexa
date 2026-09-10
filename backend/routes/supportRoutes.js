const express = require("express");
const router = express.Router();
const controller = require("../controllers/supportController");

router.post("/contact", controller.submitContact);
router.post("/message", controller.submitContact);
router.post("/ticket", controller.submitTicket);
router.get("/messages", controller.getMessages);
router.get("/faqs", controller.getFaqs);
router.get("/docs", controller.getDocs);

module.exports = router;
