const express = require("express");
const router = express.Router();
const controller = require("../controllers/systemController");

router.get("/info", controller.getSystemInfo);
router.get("/status", controller.getSystemInfo);
router.get("/storage", controller.getStorageStats);

module.exports = router;
