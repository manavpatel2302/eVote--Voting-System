const mongoose = require("mongoose");

const votingSessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Voting session title is required"],
        trim: true,
        maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    sessionId: {
        type: String,
        required: [true, "Session ID is required"],
        unique: true,
        trim: true,
    },
    candidates: [{
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        imageUrl: {
            type: String,
            default: "",
        }
    }],
    status: {
        type: String,
        enum: ["upcoming", "active", "completed", "cancelled"],
        default: "upcoming",
    },
    votingStartTime: {
        type: Date,
        required: [true, "Voting start time is required"],
    },
    votingEndTime: {
        type: Date,
        required: [true, "Voting end time is required"],
    },
    resultAnnouncementTime: {
        type: Date,
        required: [true, "Result announcement time is required"],
    },
    isResultsPublic: {
        type: Boolean,
        default: false,
    },
    allowVoteChange: {
        type: Boolean,
        default: false,
    },
    maxVotesPerUser: {
        type: Number,
        default: 1,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    settings: {
        showRealTimeResults: {
            type: Boolean,
            default: false,
        },
        showVoterCount: {
            type: Boolean,
            default: true,
        },
        requireEmailVerification: {
            type: Boolean,
            default: true,
        },
        allowAbstain: {
            type: Boolean,
            default: true,
        }
    }
}, {
    timestamps: true,
});

// Index for efficient querying
votingSessionSchema.index({ sessionId: 1 });
votingSessionSchema.index({ status: 1 });
votingSessionSchema.index({ votingStartTime: 1, votingEndTime: 1 });
votingSessionSchema.index({ resultAnnouncementTime: 1 });

// Virtual for checking if voting is currently active
votingSessionSchema.virtual('isVotingActive').get(function() {
    const now = new Date();
    return this.status === 'active' && 
           now >= this.votingStartTime && 
           now <= this.votingEndTime;
});

// Virtual for checking if results should be shown
votingSessionSchema.virtual('shouldShowResults').get(function() {
    const now = new Date();
    return this.isResultsPublic || 
           (this.resultAnnouncementTime && now >= this.resultAnnouncementTime);
});

// Method to update status based on current time
votingSessionSchema.methods.updateStatus = function() {
    const now = new Date();
    
    if (this.status === 'cancelled') return this.status;
    
    if (now < this.votingStartTime) {
        this.status = 'upcoming';
    } else if (now >= this.votingStartTime && now <= this.votingEndTime) {
        this.status = 'active';
    } else if (now > this.votingEndTime) {
        this.status = 'completed';
    }
    
    return this.status;
};

module.exports = mongoose.model("VotingSession", votingSessionSchema);