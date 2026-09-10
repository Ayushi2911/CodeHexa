const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);
router.get("/profile", authController.getProfile);
router.put("/profile", authController.updateProfile);
router.post("/change-password", authController.changePassword);
router.delete("/delete-account", authController.deleteAccount);
router.post("/delete-account", authController.deleteAccount);
router.get("/me", authController.getMe);

module.exports = router;
