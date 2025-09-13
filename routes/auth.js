const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const {
    validateRegistration,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateProfileUpdate,
} = require("../middleware/validation");

// Public routes
router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
    "/forgot-password",
    validateForgotPassword,
    authController.forgotPassword
);
router.post(
    "/reset-password",
    validateResetPassword,
    authController.resetPassword
);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);
router.put(
    "/profile",
    authenticateToken,
    validateProfileUpdate,
    authController.updateProfile
);
router.post("/logout", authenticateToken, authController.logout);

module.exports = router;