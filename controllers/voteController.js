const { validationResult } = require("express-validator");
const Vote = require("../models/Vote");
const User = require("../models/User");
const VotingSession = require("../models/VotingSession");

// Cast a vote
const castVote = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { candidate } = req.body;
        const userId = req.user._id;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get("User-Agent");

        // Check if user has already voted
        const existingVote = await Vote.findOne({
            voter: userId,
            votingSession: "general-election-2024",
        });

        if (existingVote) {
            return res.status(400).json({
                success: false,
                message: "You have already voted in this election",
            });
        }

        // Create new vote
        const vote = new Vote({
            voter: userId,
            candidate,
            votingSession: "general-election-2024",
            ipAddress,
            userAgent,
        });

        await vote.save();

        res.status(201).json({
            success: true,
            message: "Vote cast successfully",
            vote: {
                id: vote._id,
                candidate: vote.candidate,
                timestamp: vote.createdAt,
            },
        });
    } catch (error) {
        console.error("Cast vote error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cast vote",
            error: error.message,
        });
    }
};

// Get voting results (admin only)
const getResults = async(req, res) => {
    try {
        const results = await Vote.aggregate([{
                $match: {
                    votingSession: "general-election-2024",
                    isVerified: true,
                },
            },
            {
                $group: {
                    _id: "$candidate",
                    count: { $sum: 1 },
                    votes: {
                        $push: {
                            voter: "$voter",
                            timestamp: "$createdAt",
                            ipAddress: "$ipAddress",
                        },
                    },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        // Get total votes
        const totalVotes = await Vote.countDocuments({
            votingSession: "general-election-2024",
            isVerified: true,
        });

        // Get voter information for each vote
        const resultsWithVoters = await Promise.all(
            results.map(async(result) => {
                const voterIds = result.votes.map((vote) => vote.voter);
                const voters = await User.find({ _id: { $in: voterIds } }).select(
                    "name email role createdAt"
                );

                return {
                    candidate: result._id,
                    count: result.count,
                    percentage: totalVotes > 0 ? ((result.count / totalVotes) * 100).toFixed(2) : 0,
                    voters: voters.map((voter, index) => ({
                        name: voter.name,
                        email: voter.email,
                        role: voter.role,
                        votedAt: result.votes[index].timestamp,
                        ipAddress: result.votes[index].ipAddress,
                    })),
                };
            })
        );

        res.json({
            success: true,
            results: resultsWithVoters,
            totalVotes,
            votingSession: "general-election-2024",
            generatedAt: new Date(),
        });
    } catch (error) {
        console.error("Get results error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get voting results",
            error: error.message,
        });
    }
};

// Get public results (without voter details)
const getPublicResults = async(req, res) => {
    try {
        const results = await Vote.aggregate([{
                $match: {
                    votingSession: "general-election-2024",
                    isVerified: true,
                },
            },
            {
                $group: {
                    _id: "$candidate",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        const totalVotes = await Vote.countDocuments({
            votingSession: "general-election-2024",
            isVerified: true,
        });

        const publicResults = results.map((result) => ({
            candidate: result._id,
            count: result.count,
            percentage: totalVotes > 0 ? ((result.count / totalVotes) * 100).toFixed(2) : 0,
        }));

        res.json({
            success: true,
            results: publicResults,
            totalVotes,
            votingSession: "general-election-2024",
            generatedAt: new Date(),
        });
    } catch (error) {
        console.error("Get public results error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get public results",
            error: error.message,
        });
    }
};

// Check if user has voted
const checkVoteStatus = async(req, res) => {
    try {
        const userId = req.user._id;

        const existingVote = await Vote.findOne({
            voter: userId,
            votingSession: "general-election-2024",
        });

        res.json({
            success: true,
            hasVoted: !!existingVote,
            vote: existingVote ?
                {
                    candidate: existingVote.candidate,
                    timestamp: existingVote.createdAt,
                } :
                null,
        });
    } catch (error) {
        console.error("Check vote status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check vote status",
            error: error.message,
        });
    }
};

// Get voting statistics (admin only)
const getVotingStats = async(req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "voter" });
        const totalVotes = await Vote.countDocuments({
            votingSession: "general-election-2024",
            isVerified: true,
        });
        const verifiedUsers = await User.countDocuments({
            role: "voter",
            isEmailVerified: true,
        });

        const votingRate =
            verifiedUsers > 0 ? ((totalVotes / verifiedUsers) * 100).toFixed(2) : 0;

        // Get votes by hour for the last 24 hours
        const votesByHour = await Vote.aggregate([{
                $match: {
                    votingSession: "general-election-2024",
                    isVerified: true,
                    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: {
                        hour: { $hour: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.day": 1, "_id.hour": 1 },
            },
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                verifiedUsers,
                totalVotes,
                votingRate: `${votingRate}%`,
                votesByHour,
            },
        });
    } catch (error) {
        console.error("Get voting stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get voting statistics",
            error: error.message,
        });
    }
};

// Get user's vote history
const getVoteHistory = async(req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const votes = await Vote.find({ voter: userId })
            .populate('voter', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Vote.countDocuments({ voter: userId });

        // Get voting session details for each vote
        const votesWithSessions = await Promise.all(
            votes.map(async (vote) => {
                const session = await VotingSession.findOne({ sessionId: vote.votingSession });
                return {
                    id: vote._id,
                    candidate: vote.candidate,
                    votingSession: vote.votingSession,
                    sessionTitle: session ? session.title : 'Unknown Session',
                    timestamp: vote.createdAt,
                    isVerified: vote.isVerified
                };
            })
        );

        res.json({
            success: true,
            votes: votesWithSessions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalVotes: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get vote history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get vote history',
            error: error.message
        });
    }
};

// Create new voting session (admin only)
const createVotingSession = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            title,
            description,
            sessionId,
            candidates,
            votingStartTime,
            votingEndTime,
            resultAnnouncementTime,
            settings
        } = req.body;

        // Check if session ID already exists
        const existingSession = await VotingSession.findOne({ sessionId });
        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: 'Voting session with this ID already exists'
            });
        }

        const votingSession = new VotingSession({
            title,
            description,
            sessionId,
            candidates,
            votingStartTime: new Date(votingStartTime),
            votingEndTime: new Date(votingEndTime),
            resultAnnouncementTime: new Date(resultAnnouncementTime),
            createdBy: req.user._id,
            settings: settings || {}
        });

        await votingSession.save();

        res.status(201).json({
            success: true,
            message: 'Voting session created successfully',
            session: votingSession
        });
    } catch (error) {
        console.error('Create voting session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create voting session',
            error: error.message
        });
    }
};

// Get all voting sessions
const getVotingSessions = async(req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (status) {
            query.status = status;
        }

        const sessions = await VotingSession.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Update session statuses based on current time
        const updatedSessions = sessions.map(session => {
            session.updateStatus();
            return session;
        });

        const total = await VotingSession.countDocuments(query);

        res.json({
            success: true,
            sessions: updatedSessions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalSessions: total
            }
        });
    } catch (error) {
        console.error('Get voting sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get voting sessions',
            error: error.message
        });
    }
};

// Update voting session (admin only)
const updateVotingSession = async(req, res) => {
    try {
        const { sessionId } = req.params;
        const updates = req.body;

        const session = await VotingSession.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Voting session not found'
            });
        }

        // Update allowed fields
        const allowedUpdates = [
            'title', 'description', 'votingStartTime', 'votingEndTime', 
            'resultAnnouncementTime', 'isResultsPublic', 'settings'
        ];
        
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                session[field] = updates[field];
            }
        });

        await session.save();

        res.json({
            success: true,
            message: 'Voting session updated successfully',
            session
        });
    } catch (error) {
        console.error('Update voting session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update voting session',
            error: error.message
        });
    }
};

// Get enhanced public results with time-based visibility
const getEnhancedPublicResults = async(req, res) => {
    try {
        const { sessionId = 'general-election-2024' } = req.params;
        
        // Get voting session to check if results should be shown
        const session = await VotingSession.findOne({ sessionId });
        if (session && !session.shouldShowResults) {
            return res.status(403).json({
                success: false,
                message: 'Results will be announced on ' + session.resultAnnouncementTime.toLocaleString(),
                announcementTime: session.resultAnnouncementTime
            });
        }

        const results = await Vote.aggregate([
            {
                $match: {
                    votingSession: sessionId,
                    isVerified: true
                }
            },
            {
                $group: {
                    _id: '$candidate',
                    count: { $sum: 1 },
                    timestamps: { $push: '$createdAt' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalVotes = await Vote.countDocuments({
            votingSession: sessionId,
            isVerified: true
        });

        const publicResults = results.map(result => ({
            candidate: result._id,
            count: result.count,
            percentage: totalVotes > 0 ? ((result.count / totalVotes) * 100).toFixed(2) : 0
        }));

        res.json({
            success: true,
            results: publicResults,
            totalVotes,
            votingSession: sessionId,
            sessionInfo: session ? {
                title: session.title,
                status: session.status,
                announcementTime: session.resultAnnouncementTime
            } : null,
            generatedAt: new Date()
        });
    } catch (error) {
        console.error('Get enhanced public results error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get public results',
            error: error.message
        });
    }
};

// Set result announcement time (admin only)
const setResultAnnouncementTime = async(req, res) => {
    try {
        const { sessionId } = req.params;
        const { announcementTime, makeResultsPublic } = req.body;

        const session = await VotingSession.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Voting session not found'
            });
        }

        session.resultAnnouncementTime = new Date(announcementTime);
        if (makeResultsPublic !== undefined) {
            session.isResultsPublic = makeResultsPublic;
        }

        await session.save();

        res.json({
            success: true,
            message: 'Result announcement time updated successfully',
            announcementTime: session.resultAnnouncementTime,
            isResultsPublic: session.isResultsPublic
        });
    } catch (error) {
        console.error('Set result announcement time error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set result announcement time',
            error: error.message
        });
    }
};

module.exports = {
    castVote,
    getResults,
    getPublicResults,
    checkVoteStatus,
    getVotingStats,
    getVoteHistory,
    createVotingSession,
    getVotingSessions,
    updateVotingSession,
    getEnhancedPublicResults,
    setResultAnnouncementTime
};
