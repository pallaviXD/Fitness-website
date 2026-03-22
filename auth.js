// ===================================
// AUTHENTICATION SYSTEM FOR FITTRACK PRO
// This file handles user registration, login, and session management
// ===================================

// ===================================
// 1. DATABASE SIMULATION
// In a real app, this would be a server/database
// For now, we store users in memory (resets on page refresh)
// ===================================

let usersDatabase = {
    // Demo account pre-loaded
    'demo@fittrack.com': {
        name: 'Demo User',
        email: 'demo@fittrack.com',
        password: hashPassword('demo123'), // Hashed password
        profile: {
            age: 25,
            gender: 'male',
            height: 175,
            weight: 70,
            goal: 'weight-loss',
            activity: 'moderate'
        },
        createdAt: new Date().toISOString()
    }
};

// Current logged-in user
let currentUser = null;

// ===================================
// 2. SIMPLE PASSWORD HASHING
// Basic security - converts password to hash
// In production, use bcrypt or similar
// ===================================

function hashPassword(password) {
    // Simple hash function (NOT secure for production!)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

// ===================================
// 3. PAGE LOAD INITIALIZATION
// Check if user is logged in when page loads
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Authentication system loaded');
    
    // Check if user has an active session
    checkSession();
    
    // If on profile completion page, show current user
    if (document.getElementById('currentUserEmail')) {
        displayCurrentUser();
    }
});

// ===================================
// 4. SESSION MANAGEMENT
// ===================================

function checkSession() {
    // Check if there's a logged-in user in memory
    // In a real app, this would check server session or JWT token
    
    const currentPage = window.location.pathname.split('/').pop();
    
    // If user is logged in and on login page, redirect to profile
    if (currentUser && currentPage === 'login.html') {
        window.location.href = 'index.html';
    }
    
    // If user is NOT logged in and on protected pages, redirect to login
    const protectedPages = ['index.html', 'dashboard.html', 'workout.html', 'progress.html'];
    if (!currentUser && protectedPages.includes(currentPage)) {
        // Allow access to index.html only if coming from signup
        if (currentPage !== 'index.html') {
            window.location.href = 'login.html';
        }
    }
}

function createSession(user) {
    // Store current user in memory
    currentUser = user;
    console.log('✅ Session created for:', user.email);
}

function destroySession() {
    // Clear current user
    currentUser = null;
    console.log('🚪 Session destroyed');
}

// ===================================
// 5. SIGNUP HANDLING
// ===================================

function handleSignup(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupPasswordConfirm').value;
    
    // Clear previous messages
    hideMessage('signupError');
    hideMessage('signupSuccess');
    
    // Validation: Check if passwords match
    if (password !== confirmPassword) {
        showMessage('signupError', '❌ Passwords do not match!');
        return;
    }
    
    // Validation: Check if email already exists
    if (usersDatabase[email]) {
        showMessage('signupError', '❌ This email is already registered. Please login instead.');
        return;
    }
    
    // Validation: Password strength (minimum 6 characters)
    if (password.length < 6) {
        showMessage('signupError', '❌ Password must be at least 6 characters long.');
        return;
    }
    
    // Create new user account
    const newUser = {
        name: name,
        email: email,
        password: hashPassword(password), // Hash the password
        profile: null, // Profile will be completed next
        createdAt: new Date().toISOString()
    };
    
    // Save to database
    usersDatabase[email] = newUser;
    
    // Create session
    createSession(newUser);
    
    // Show success message
    showMessage('signupSuccess', '✅ Account created successfully! Redirecting...');
    
    // Redirect to profile completion after 2 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
    
    console.log('✅ New user registered:', email);
}

// ===================================
// 6. LOGIN HANDLING
// ===================================

function handleLogin(event) {
    event.preventDefault();
    
    // Get form values
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Clear previous error
    hideMessage('loginError');
    
    // Check if user exists
    const user = usersDatabase[email];
    
    if (!user) {
        showMessage('loginError', '❌ No account found with this email. Please sign up first.');
        return;
    }
    
    // Verify password
    const hashedPassword = hashPassword(password);
    
    if (user.password !== hashedPassword) {
        showMessage('loginError', '❌ Incorrect password. Please try again.');
        return;
    }
    
    // Successful login!
    createSession(user);
    
    console.log('✅ User logged in:', email);
    
    // Check if profile is complete
    if (!user.profile) {
        // Redirect to profile completion
        window.location.href = 'index.html';
    } else {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// ===================================
// 7. PROFILE COMPLETION
// ===================================

function handleProfileCompletion(event) {
    event.preventDefault();
    
    // Make sure user is logged in
    if (!currentUser) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return;
    }
    
    // Get profile data
    const profileData = {
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        height: parseInt(document.getElementById('height').value),
        weight: parseInt(document.getElementById('weight').value),
        goal: document.getElementById('goal').value,
        activity: document.getElementById('activity').value
    };
    
    // Save profile to user account
    currentUser.profile = profileData;
    usersDatabase[currentUser.email].profile = profileData;
    
    console.log('✅ Profile completed for:', currentUser.email);
    
    // Show success and redirect
    alert('🎉 Profile completed successfully! Welcome to FitTrack Pro, ' + currentUser.name + '!');
    window.location.href = 'dashboard.html';
}

// ===================================
// 8. DISPLAY CURRENT USER INFO
// ===================================

function displayCurrentUser() {
    if (currentUser) {
        const emailElement = document.getElementById('currentUserEmail');
        if (emailElement) {
            emailElement.textContent = currentUser.email;
        }
    }
}

// ===================================
// 9. PASSWORD RESET
// ===================================

function handlePasswordReset(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim().toLowerCase();
    
    // Check if user exists
    if (!usersDatabase[email]) {
        showMessage('resetSuccess', '⚠️ If an account exists with this email, you will receive reset instructions.');
    } else {
        showMessage('resetSuccess', '✅ Password reset link sent to ' + email + ' (simulated).');
    }
    
    // In a real app, this would send an email
    console.log('🔑 Password reset requested for:', email);
}

// ===================================
// 10. LOGOUT FUNCTION
// ===================================

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        destroySession();
        alert('✅ Logged out successfully!');
        window.location.href = 'login.html';
    }
}

// ===================================
// 11. UI HELPER FUNCTIONS
// ===================================

function showMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// ===================================
// 12. FORM SWITCHING FUNCTIONS
// ===================================

function showLoginForm() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
}

function showSignupForm() {
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
}

function showForgotPassword() {
    document.getElementById('forgotPasswordForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.remove('active');
}

// ===================================
// 13. GET CURRENT USER DATA
// For use in other pages (dashboard, etc.)
// ===================================

function getCurrentUser() {
    return currentUser;
}

function isAuthenticated() {
    return currentUser !== null;
}

// ===================================
// 14. LOAD USER IN NAVIGATION
// Used by dashboard, workout, and progress pages
// ===================================

function loadUserInNav() {
    if (currentUser) {
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = 'Welcome, ' + currentUser.name;
        });
    }
}

// ===================================
// DEBUGGING
// ===================================

console.log('👥 Users Database:', usersDatabase);
console.log('Current User:', currentUser);

// Make functions available globally
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleProfileCompletion = handleProfileCompletion;
window.handlePasswordReset = handlePasswordReset;
window.showLoginForm = showLoginForm;
window.showSignupForm = showSignupForm;
window.showForgotPassword = showForgotPassword;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;