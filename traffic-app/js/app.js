// DOM Elements
const video = document.getElementById('cameraFeed');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

// System State
let isRunning = false;
let model;
let detectionInterval;

// Initialize the application
async function init() {
    try {
        // Load TensorFlow model
        model = await cocoSsd.load();
        console.log('Model loaded successfully');
        
        // Set up event listeners
        startBtn.addEventListener('click', startDetection);
        stopBtn.addEventListener('click', stopDetection);
        
        console.log('Application initialized');
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize application');
    }
}

// Start detection
async function startDetection() {
    if (isRunning) return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        isRunning = true;
        
        // Start detection loop
        detectionInterval = setInterval(detectViolations, 100);
        
        console.log('Detection started');
    } catch (error) {
        console.error('Error starting detection:', error);
        alert('Could not access camera');
    }
}

// Stop detection
function stopDetection() {
    if (!isRunning) return;
    
    clearInterval(detectionInterval);
    
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    video.srcObject = null;
    isRunning = false;
    console.log('Detection stopped');
}

// Detect traffic violations
async function detectViolations() {
    if (!model || !isRunning) return;
    
    try {
        const predictions = await model.detect(video);
        
        // Process predictions for violations
        predictions.forEach(pred => {
            if (pred.class === 'car' || pred.class === 'truck') {
                checkLineCrossing(pred);
            }
        });
    } catch (error) {
        console.error('Detection error:', error);
    }
}

// Check if vehicle crossed the line
function checkLineCrossing(prediction) {
    const lineY = video.videoHeight * 0.6; // 60% from top
    const vehicleBottom = prediction.bbox[1] + prediction.bbox[3];
    
    if (vehicleBottom > lineY) {
        console.log('Violation detected:', prediction.class);
        // Add your violation handling logic here
    }
}

// Initialize the app when loaded
document.addEventListener('DOMContentLoaded', init);