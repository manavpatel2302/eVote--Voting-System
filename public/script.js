// Main JavaScript for the voting website

document.addEventListener("DOMContentLoaded", function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Check authentication status
    checkAuthStatus();

    // Load public statistics
    loadPublicStats();

    // Set up navigation
    setupNavigation();

    // Set up mobile menu
    setupMobileMenu();
}

function checkAuthStatus() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (token && user) {
        // User is logged in
        updateNavigationForLoggedInUser(user);
    } else {
        // User is not logged in
        updateNavigationForGuest();
    }
}

function updateNavigationForLoggedInUser(user) {
    // Hide login/signup links
    const loginLink = document.getElementById("login-link");
    const signupLink = document.getElementById("signup-link");

    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";

    // Show profile and logout links
    const profileLink = document.getElementById("profile-link");
    const logoutLink = document.getElementById("logout-link");
    const votingLink = document.getElementById("voting-link");

    if (profileLink) {
        profileLink.style.display = "inline";
        profileLink.textContent = user.name || "Profile";
    }

    if (logoutLink) {
        logoutLink.style.display = "inline";
        logoutLink.addEventListener("click", handleLogout);
    }

    if (votingLink) {
        votingLink.style.display = "inline";
    }

    // Update hero section for logged in user
    updateHeroForLoggedInUser(user);
}

function updateNavigationForGuest() {
    // Show login/signup links
    const loginLink = document.getElementById("login-link");
    const signupLink = document.getElementById("signup-link");

    if (loginLink) loginLink.style.display = "inline";
    if (signupLink) signupLink.style.display = "inline";

    // Hide profile and logout links
    const profileLink = document.getElementById("profile-link");
    const logoutLink = document.getElementById("logout-link");
    const votingLink = document.getElementById("voting-link");

    if (profileLink) profileLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "none";
    if (votingLink) votingLink.style.display = "none";
}

function updateHeroForLoggedInUser(user) {
    const heroSignup = document.getElementById("hero-signup");
    if (heroSignup) {
        heroSignup.textContent = "Go to Voting";
        heroSignup.href = "/voting";
    }
}

async function loadPublicStats() {
    try {
        const response = await fetch("/api/vote/results/public");
        const data = await response.json();

        if (data.success) {
            updateStatsDisplay(data);
        }
    } catch (error) {
        console.error("Error loading public stats:", error);
        // Don't show error to user for public stats
    }
}

function updateStatsDisplay(data) {
    const totalVotesElement = document.getElementById("total-votes");
    if (totalVotesElement) {
        totalVotesElement.textContent = data.totalVotes || "0";
    }

    // Calculate voting rate (this would need additional API endpoint for total users)
    // For now, we'll just show the total votes
}

function setupNavigation() {
    // Add click handlers for navigation links
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
        link.addEventListener("click", function(e) {
            // Remove active class from all links
            navLinks.forEach((l) => l.classList.remove("active"));
            // Add active class to clicked link
            this.classList.add("active");
        });
    });
}

function setupMobileMenu() {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", function() {
            navMenu.classList.toggle("active");
            hamburger.classList.toggle("active");
        });

        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
            link.addEventListener("click", function() {
                navMenu.classList.remove("active");
                hamburger.classList.remove("active");
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener("click", function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove("active");
                hamburger.classList.remove("active");
            }
        });
    }
}

async function handleLogout() {
    try {
        const token = localStorage.getItem("token");

        if (token) {
            // Call logout API
            await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        // Clear local storage regardless of API call result
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to home page
        window.location.href = "/";
    }
}

// Utility functions
function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    // Set background color based on type
    const colors = {
        success: "#28a745",
        error: "#dc3545",
        warning: "#ffc107",
        info: "#17a2b8",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// API helper functions
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem("token");

    const defaultOptions = {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    } catch (error) {
        console.error("API request error:", error);
        throw error;
    }
}

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    // At least 6 characters, one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return re.test(password);
}

function showFormError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => {
        element.textContent = "";
        element.style.display = "none";
    });
}

// Export functions for use in other pages
window.VotingApp = {
    showNotification,
    apiRequest,
    validateEmail,
    validatePassword,
    showFormError,
    clearFormErrors,
    handleLogout,
};