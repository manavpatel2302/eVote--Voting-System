const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token
const authenticateToken = async(req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token required",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token - user not found",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication error",
            error: error.message,
        });
    }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }
    next();
};

// Check if user is verified
const requireEmailVerification = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: "Email verification required",
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireEmailVerification,
};