const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
    voter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Voter is required"],
    },
    candidate: {
        type: String,
        required: [true, "Candidate selection is required"],
        enum: ["candidate1", "candidate2", "candidate3", "abstain"],
    },
    votingSession: {
        type: String,
        required: [true, "Voting session is required"],
        default: "general-election-2024",
    },
    ipAddress: {
        type: String,
        required: [true, "IP address is required"],
    },
    userAgent: {
        type: String,
        required: [true, "User agent is required"],
    },
    isVerified: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Ensure one vote per user per session
voteSchema.index({ voter: 1, votingSession: 1 }, { unique: true });

// Add text index for searching
voteSchema.index({ candidate: "text", votingSession: "text" });

module.exports = mongoose.model("Vote", voteSchema);