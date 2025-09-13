const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const {
    authenticateToken,
    requireAdmin,
    requireEmailVerification,
} = require("../middleware/auth");
const { validateVote } = require("../middleware/validation");

// Protected routes - require authentication and email verification
router.post(
    "/cast",
    authenticateToken,
    requireEmailVerification,
    validateVote,
    voteController.castVote
);
router.get("/status", authenticateToken, voteController.checkVoteStatus);

// Vote history for authenticated users
router.get("/history", authenticateToken, voteController.getVoteHistory);

// Public results (no voter details)
router.get("/results/public", voteController.getPublicResults);
router.get("/results/public/:sessionId", voteController.getEnhancedPublicResults);

// Admin routes - require admin role
router.get(
    "/results",
    authenticateToken,
    requireAdmin,
    voteController.getResults
);
router.get(
    "/stats",
    authenticateToken,
    requireAdmin,
    voteController.getVotingStats
);

// Admin routes for session management
router.post(
    "/sessions",
    authenticateToken,
    requireAdmin,
    voteController.createVotingSession
);
router.get(
    "/sessions",
    authenticateToken,
    requireAdmin,
    voteController.getVotingSessions
);
router.put(
    "/sessions/:sessionId",
    authenticateToken,
    requireAdmin,
    voteController.updateVotingSession
);
router.put(
    "/sessions/:sessionId/announcement-time",
    authenticateToken,
    requireAdmin,
    voteController.setResultAnnouncementTime
);

module.exports = router;
