const express = require("express");
const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Voting Website API is running",
        timestamp: new Date(),
        version: "1.0.0",
    });
});

// API info endpoint
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Voting Website API",
        endpoints: {
            auth: {
                "POST /api/auth/register": "Register new user",
                "POST /api/auth/login": "Login user",
                "GET /api/auth/verify-email/:token": "Verify email",
                "POST /api/auth/forgot-password": "Request password reset",
                "POST /api/auth/reset-password": "Reset password",
                "GET /api/auth/profile": "Get user profile (protected)",
                "PUT /api/auth/profile": "Update user profile (protected)",
                "POST /api/auth/logout": "Logout user (protected)",
            },
            vote: {
                "POST /api/vote/cast": "Cast a vote (protected)",
                "GET /api/vote/status": "Check vote status (protected)",
                "GET /api/vote/results/public": "Get public results",
                "GET /api/vote/results": "Get detailed results (admin)",
                "GET /api/vote/stats": "Get voting statistics (admin)",
            },
        },
    });
});

module.exports = router;