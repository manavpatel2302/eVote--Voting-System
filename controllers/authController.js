const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// Create email transporter
const createTransporter = () => {
    // Check if email configuration is available
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }
    
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Send email
const sendEmail = async(to, subject, html) => {
    try {
        const transporter = createTransporter();
        
        // If email is not configured, return false but don't crash
        if (!transporter) {
            console.log("Email not configured - skipping email send to:", to);
            return false;
        }
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error("Email sending error:", error);
        return false;
    }
};

// Register new user
const register = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: role || "voter",
            emailVerificationToken,
            emailVerificationExpires,
        });

        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
        const emailSent = await sendEmail(
            email,
            "Verify Your Email - Voting Website",
            `
        <h2>Welcome to Voting Website!</h2>
        <p>Hi ${name},</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `
        );
        
        // If email is not configured, auto-verify for development
        if (!emailSent && process.env.NODE_ENV === 'development') {
            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();
            console.log(`Development mode: Auto-verified email for ${email}`);
        }

        const message = emailSent 
            ? "User registered successfully. Please check your email for verification."
            : "User registered successfully. Email verification auto-completed for development."
            
        res.status(201).json({
            success: true,
            message: message,
            user: user.toJSON(),
            emailSent,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
};

// Login user
const login = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in",
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

// Verify email
const verifyEmail = async(req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token",
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({
            success: false,
            message: "Email verification failed",
            error: error.message,
        });
    }
};

// Forgot password
const forgotPassword = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User with this email not found",
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const emailSent = await sendEmail(
            email,
            "Password Reset - Voting Website",
            `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
        );

        res.json({
            success: true,
            message: "Password reset email sent",
            emailSent,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Password reset request failed",
            error: error.message,
        });
    }
};

// Reset password
const resetPassword = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Password reset failed",
            error: error.message,
        });
    }
};

// Get current user profile
const getProfile = async(req, res) => {
    try {
        res.json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get profile",
            error: error.message,
        });
    }
};

// Update user profile
const updateProfile = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { name } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: user.toJSON(),
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Profile update failed",
            error: error.message,
        });
    }
};

// Logout (client-side token removal)
const logout = async(req, res) => {
    res.json({
        success: true,
        message: "Logged out successfully",
    });
};

module.exports = {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    logout,
};