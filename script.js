// ===================================
// GLOBAL VARIABLES & CONSTANTS
// ===================================

// User data storage
let userData = {
    name: '',
    email: '',
    age: 0,
    gender: '',
    height: 0,
    weight: 0,
    goal: '',
    activity: ''
};

// Dashboard tracking variables
let steps = 0;
let water = 0;
let heartRate = 72; // Starting heart rate
let caloriesBurned = 0;
let distanceKm = 0;

// Goals
const STEPS_GOAL = 10000;
const WATER_GOAL = 8;

// GPS tracking variables
let latitude = null;
let longitude = null;
let gpsAccuracy = null;

// ===================================
// PAGE INITIALIZATION
// Check which page we're on and initialize accordingly
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on registration page
    if (document.querySelector('.registration-page')) {
        console.log('Registration page loaded');
    }
    
    // Check if we're on dashboard page
    if (document.querySelector('.dashboard-page')) {
        initializeDashboard();
    }
    
    // Check if we're on workout page
    if (document.querySelector('.workout-page')) {
        initializeWorkout();
    }
    
    // Check if we're on progress page
    if (document.querySelector('.progress-page')) {
        initializeProgress();
    }
    
    // Load user data on all pages
    loadUserData();
});

// ===================================
// REGISTRATION FUNCTIONS
// ===================================

// Handle registration form submission
function handleRegistration(event) {
    // Prevent form from refreshing the page
    event.preventDefault();
    
    // Get form values
    userData.name = document.getElementById('fullName').value;
    userData.email = document.getElementById('email').value;
    userData.age = document.getElementById('age').value;
    userData.gender = document.getElementById('gender').value;
    userData.height = document.getElementById('height').value;
    userData.weight = document.getElementById('weight').value;
    userData.goal = document.getElementById('goal').value;
    userData.activity = document.getElementById('activity').value;
    
    // Save to browser's memory (not localStorage as it's not supported)
    // In a real app, this would go to a server
    console.log('User registered:', userData);
    
    // Show success message
    alert('Registration successful! Welcome to FitTrack Pro, ' + userData.name + '! 🎉');
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// ===================================
// DASHBOARD INITIALIZATION
// ===================================

function initializeDashboard() {
    // Display current date
    displayCurrentDate();
    
    // Start heart rate simulation
    startHeartRateMonitor();
    
    // Initialize all counters to 0
    updateAllDisplays();
    
    // Auto-update calories every second based on activity
    setInterval(updateCaloriesBurned, 1000);
}

// Display today's date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (!dateElement) return;
    
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const formattedDate = today.toLocaleDateString('en-US', options);
    dateElement.textContent = formattedDate;
}

// ===================================
// SENSOR SIMULATION: HEART RATE
// ===================================

function startHeartRateMonitor() {
    // Simulate heart rate changes every 2 seconds
    setInterval(function() {
        // Simulate realistic heart rate between 60-100 BPM
        // Add random variation of ±3 BPM
        const variation = Math.floor(Math.random() * 7) - 3; // Random between -3 and +3
        heartRate = Math.max(60, Math.min(100, heartRate + variation));
        
        // Update display
        const heartRateElement = document.getElementById('heartRate');
        if (heartRateElement) {
            heartRateElement.textContent = heartRate;
        }
        
        // Update status based on heart rate
        updateHeartRateStatus();
    }, 2000); // Update every 2 seconds
}

function updateHeartRateStatus() {
    const statusElement = document.getElementById('heartStatus');
    if (!statusElement) return;
    
    if (heartRate < 60) {
        statusElement.textContent = 'Low - Rest Mode';
        statusElement.style.color = '#4CAF50';
    } else if (heartRate >= 60 && heartRate <= 80) {
        statusElement.textContent = 'Normal - Healthy';
        statusElement.style.color = '#4CAF50';
    } else if (heartRate > 80 && heartRate <= 90) {
        statusElement.textContent = 'Elevated - Light Activity';
        statusElement.style.color = '#FFA726';
    } else {
        statusElement.textContent = 'High - Active Exercise';
        statusElement.style.color = '#FF3B3B';
    }
}

// ===================================
// SENSOR SIMULATION: STEP COUNTER
// ===================================

function addSteps() {
    // Add 100 steps
    steps += 100;
    
    // Calculate distance (average: 0.0008 km per step)
    distanceKm = (steps * 0.0008).toFixed(2);
    
    // Update displays
    updateAllDisplays();
    
    // Increase heart rate slightly when walking
    heartRate = Math.min(95, heartRate + 2);
}

function resetSteps() {
    steps = 0;
    distanceKm = 0;
    updateAllDisplays();
}

// ===================================
// WATER INTAKE TRACKER
// ===================================

function addWater() {
    // Add one glass of water
    water += 1;
    updateAllDisplays();
}

function resetWater() {
    water = 0;
    updateAllDisplays();
}

// ===================================
// GPS LOCATION TRACKING
// ===================================

function getLocation() {
    const statusElement = document.getElementById('gpsStatus');
    
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    // Update status
    if (statusElement) {
        statusElement.textContent = 'LOCATING...';
        statusElement.classList.remove('live');
        statusElement.classList.add('active');
    }
    
    // Get current position
    navigator.geolocation.getCurrentPosition(
        // Success callback
        function(position) {
            latitude = position.coords.latitude.toFixed(6);
            longitude = position.coords.longitude.toFixed(6);
            gpsAccuracy = position.coords.accuracy.toFixed(0);
            
            // Update display
            document.getElementById('latitude').textContent = latitude + '°';
            document.getElementById('longitude').textContent = longitude + '°';
            document.getElementById('accuracy').textContent = gpsAccuracy + ' meters';
            
            // Update location name (simplified)
            document.getElementById('locationName').textContent = 'Location detected successfully!';
            
            // Update status badge
            if (statusElement) {
                statusElement.textContent = 'CONNECTED';
                statusElement.classList.remove('active');
                statusElement.classList.add('live');
            }
            
            console.log('GPS Location:', latitude, longitude);
        },
        // Error callback
        function(error) {
            let errorMsg = 'Unable to retrieve location';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Location permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Location unavailable';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Location request timeout';
                    break;
            }
            
            alert(errorMsg + '. Please enable location services.');
            
            if (statusElement) {
                statusElement.textContent = 'DISCONNECTED';
            }
        },
        // Options
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ===================================
// CALORIES CALCULATION
// ===================================

function updateCaloriesBurned() {
    // Simple calorie calculation based on steps
    // Rough estimate: 100 steps = ~5 calories
    caloriesBurned = Math.floor(steps * 0.05);
    
    const caloriesElement = document.getElementById('caloriesBurned');
    if (caloriesElement) {
        caloriesElement.textContent = caloriesBurned;
    }
}

// ===================================
// PROGRESS CALCULATION
// ===================================

function updateProgress() {
    // Calculate steps progress percentage
    let stepsProgress = (steps / STEPS_GOAL) * 100;
    if (stepsProgress > 100) stepsProgress = 100;
    
    // Calculate water progress percentage
    let waterProgress = (water / WATER_GOAL) * 100;
    if (waterProgress > 100) waterProgress = 100;
    
    // Calculate overall progress (average of both)
    let totalProgress = Math.round((stepsProgress + waterProgress) / 2);
    
    // Update percentage text
    const percentElement = document.getElementById('progressPercent');
    if (percentElement) {
        percentElement.textContent = totalProgress;
    }
    
    // Update circular progress bar
    // SVG circle has circumference of ~283
    // strokeDashoffset determines how much is filled
    const progressCircle = document.getElementById('progressCircle');
    if (progressCircle) {
        const offset = 283 - (283 * totalProgress) / 100;
        progressCircle.style.strokeDashoffset = offset;
    }
}

// ===================================
// UPDATE ALL DISPLAYS
// ===================================

function updateAllDisplays() {
    // Update steps
    const stepsElement = document.getElementById('stepsCount');
    if (stepsElement) {
        stepsElement.textContent = steps;
    }
    
    // Update distance
    const distanceElement = document.getElementById('distanceKm');
    if (distanceElement) {
        distanceElement.textContent = distanceKm;
    }
    
    // Update water
    const waterElement = document.getElementById('waterCount');
    if (waterElement) {
        waterElement.textContent = water;
    }
    
    // Update progress
    updateProgress();
}

// ===================================
// WORKOUT PAGE FUNCTIONS
// ===================================

function initializeWorkout() {
    // Show weight loss plan by default
    showPlan('weight-loss');
}

function showPlan(planType) {
    // Hide all plans
    const allPlans = document.querySelectorAll('.plan-section');
    allPlans.forEach(plan => plan.classList.remove('active'));
    
    // Remove active class from all tabs
    const allTabs = document.querySelectorAll('.plan-tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected plan
    if (planType === 'weight-loss') {
        document.getElementById('weight-loss-plan').classList.add('active');
        event.target.classList.add('active');
    } else if (planType === 'weight-gain') {
        document.getElementById('weight-gain-plan').classList.add('active');
        event.target.classList.add('active');
    }
}

function startWorkout(workoutName) {
    // Simulate starting a workout
    alert('Starting workout: ' + workoutName + '! 💪\n\nRemember to:\n✓ Warm up properly\n✓ Stay hydrated\n✓ Listen to your body\n✓ Cool down after');
    
    // Increase heart rate when workout starts
    heartRate = Math.min(100, heartRate + 15);
    
    // Add some steps for the workout
    steps += 500;
    updateAllDisplays();
}

// ===================================
// PROGRESS PAGE FUNCTIONS
// ===================================

function initializeProgress() {
    console.log('Progress page initialized');
    // In a real app, this would load user's actual progress data
}

// ===================================
// USER DATA MANAGEMENT
// ===================================

function loadUserData() {
    // Load user name and display in navigation
    const userNameElements = document.querySelectorAll('.user-name');
    
    if (userData.name) {
        userNameElements.forEach(element => {
            element.textContent = 'Welcome, ' + userData.name;
        });
    } else {
        userNameElements.forEach(element => {
            element.textContent = 'Welcome User';
        });
    }
}

function logout() {
    // Clear user data
    userData = {
        name: '',
        email: '',
        age: 0,
        gender: '',
        height: 0,
        weight: 0,
        goal: '',
        activity: ''
    };
    
    // Reset all tracking data
    steps = 0;
    water = 0;
    heartRate = 72;
    caloriesBurned = 0;
    
    // Show logout message
    alert('Logged out successfully! 👋');
    
    // Redirect to registration page
    window.location.href = 'index.html';
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate BMI (Body Mass Index)
function calculateBMI(weight, height) {
    // BMI = weight(kg) / (height(m))^2
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
}

// ===================================
// DEBUGGING & CONSOLE LOGS
// ===================================

console.log('FitTrack Pro - JavaScript Loaded Successfully! 💪');
console.log('Current page tracking initialized');

// Log sensor updates for debugging
setInterval(function() {
    console.log('Sensors Update:', {
        steps: steps,
        water: water,
        heartRate: heartRate,
        calories: caloriesBurned,
        distance: distanceKm + ' km'
    });
}, 30000); // Log every 30 seconds