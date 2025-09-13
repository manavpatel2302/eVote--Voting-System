const { body } = require("express-validator");

// User registration validation
const validateRegistration = [
    body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
    body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
    body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
    body("role")
    .optional()
    .isIn(["voter", "admin"])
    .withMessage("Role must be either voter or admin"),
];

// User login validation
const validateLogin = [
    body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
];

// Forgot password validation
const validateForgotPassword = [
    body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

// Reset password validation
const validateResetPassword = [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
];

// Profile update validation
const validateProfileUpdate = [
    body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
];

// Vote casting validation
const validateVote = [
    body("candidate")
    .isIn(["candidate1", "candidate2", "candidate3", "abstain"])
    .withMessage("Invalid candidate selection"),
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateProfileUpdate,
    validateVote,
};