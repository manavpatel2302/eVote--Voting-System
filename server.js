const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const voteRoutes = require("./routes/vote");
const indexRoutes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api", indexRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/vote", voteRoutes);

// Serve HTML pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/voting", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "voting.html"));
});

app.get("/results", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "results.html"));
});

app.get("/forgot-password", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "forgot-password.html"));
});

app.get("/reset-password", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "reset-password.html"));
});

app.get("/verify-email", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "verify-email.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/admin-sessions", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin-sessions.html"));
});

app.get("/vote-history", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "vote-history.html"));
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error("Global error handler:", error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
});

// Database connection
const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

// Start server
const startServer = async() => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 Frontend: http://localhost:${PORT}`);
        console.log(`🔗 API: http://localhost:${PORT}/api`);
        console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    });
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log("Unhandled Promise Rejection:", err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception:", err.message);
    process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    mongoose.connection.close(() => {
        console.log("MongoDB connection closed.");
        process.exit(0);
    });
});

startServer();