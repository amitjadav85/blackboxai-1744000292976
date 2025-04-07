// DOM Elements
const video = document.getElementById('cameraFeed');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const alertsContainer = document.getElementById('alertsContainer');
const speedOverlay = document.getElementById('speedOverlay');
const vehicleCountElement = document.getElementById('vehicleCount');
const violationCountElement = document.getElementById('violationCount');
const uptimeElement = document.getElementById('uptime');

// System variables
let model, ocr;
let isRunning = false;
let detectionInterval;
let violationCount = 0;
let vehicleCount = 0;
let startTime = 0;
let uptimeInterval;
const redLineY = 0.6; // 60% from top of video frame
let crossingVehicles = new Set();

// Speed calculation variables
const speedLimit = 50; // km/h (example)
const previousPositions = new Map();
const frameRate = 10; // FPS for detection
const pixelsToKm = 0.0001; // Conversion factor (simplified)

// Initialize TensorFlow.js model
async function initModel() {
    try {
        model = await cocoSsd.load();
        console.log('Model loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading model:', error);
        showAlert('Model failed to load', 'error');
        return false;
    }
}

// Start the detection system
async function startSystem() {
    if (isRunning) return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        isRunning = true;
        
        if (!model) {
            const modelLoaded = await initModel();
            if (!modelLoaded) return;
        }

        // Start detection loop
        detectionInterval = setInterval(detectViolations, 1000 / frameRate);
        
        // Start uptime counter
        startTime = Date.now();
        uptimeInterval = setInterval(updateUptime, 1000);
        
        showAlert('System started successfully', 'success');
    } catch (error) {
        console.error('Error accessing camera:', error);
        showAlert('Camera access denied', 'error');
    }
}

// Stop the detection system
function stopSystem() {
    if (!isRunning) return;
    
    clearInterval(detectionInterval);
    clearInterval(uptimeInterval);
    
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    video.srcObject = null;
    isRunning = false;
    speedOverlay.textContent = '';
    showAlert('System stopped', 'info');
}

// Visual feedback functions
function flashRedLine() {
    const canvas = document.getElementById('overlayCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    // Flash white then return to red
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * redLineY);
    ctx.lineTo(canvas.width, canvas.height * redLineY);
    ctx.stroke();
    
    setTimeout(() => {
        drawRedLine();
    }, 200);
}

function addCrossingMarker(x, y) {
    const canvas = document.getElementById('overlayCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    setTimeout(() => {
        drawRedLine(); // Redraw line to clear marker
    }, 1000);
}

// Draw red line on canvas
function drawRedLine() {
    const canvas = document.getElementById('overlayCanvas');
    if (!canvas || !video.videoWidth) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw prominent red line
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * redLineY);
    ctx.lineTo(canvas.width, canvas.height * redLineY);
    ctx.stroke();
    
    // Add glow effect
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * redLineY);
    ctx.lineTo(canvas.width, canvas.height * redLineY);
    ctx.stroke();
}


// Detect red line crossings
function checkLineCrossing(predictions) {
    predictions.forEach(prediction => {
        if (prediction.class === 'car' || prediction.class === 'truck') {
            const vehicleId = `${prediction.class}-${prediction.bbox[0]}-${prediction.bbox[1]}`;
            const centerY = prediction.bbox[1] + (prediction.bbox[3] / 2);
            
            if (centerY > video.videoHeight * redLineY && !crossingVehicles.has(vehicleId)) {
                                crossingVehicles.add(vehicleId);
                const violationMsg = `Red line crossed by ${prediction.class}`;
                showAlert(violationMsg, 'violation');
                
                // Visual feedback - flash the line
                flashRedLine();
                
                logViolation({
                    type: 'red_line_crossing', 
                    vehicle_type: prediction.class,
                    timestamp: new Date().toISOString()
                });

                // Add visual indicator on crossing location
                addCrossingMarker(prediction.bbox[0], prediction.bbox[1]);

            }
        }
    });
}

// Detect traffic violations
async function detectViolations() {
    if (!model || !isRunning) return;
    
    try {
        const predictions = await model.detect(video);
        drawRedLine();
        checkLineCrossing(predictions);
        vehicleCount = predictions.filter(p => p.class === 'car' || p.class === 'truck').length;
        vehicleCountElement.textContent = vehicleCount;
        
        // Process each vehicle
        predictions.forEach(prediction => {
            if (prediction.class === 'car' || prediction.class === 'truck') {
                const vehicleId = `${prediction.class}-${prediction.bbox[0]}-${prediction.bbox[1]}`;
                const currentTime = Date.now();
                
                // Calculate speed if we have previous position
                if (previousPositions.has(vehicleId)) {
                    const { bbox: prevBbox, time: prevTime } = previousPositions.get(vehicleId);
                    const distance = calculateDistance(prevBbox, prediction.bbox);
                    const timeDiff = (currentTime - prevTime) / 1000; // in seconds
                    
                    if (timeDiff > 0) {
                        const speed = (distance * pixelsToKm * 3600) / timeDiff; // km/h
                        speedOverlay.textContent = `${Math.round(speed)} km/h`;
                        
                        // Check for speeding violation
                        if (speed > speedLimit) {
                            const violationMsg = `Speeding: ${Math.round(speed)} km/h in ${speedLimit} km/h zone`;
                            showAlert(violationMsg, 'violation');
                            logViolation({
                                type: 'speeding',
                                speed: Math.round(speed),
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
                
                // Update vehicle position
                previousPositions.set(vehicleId, {
                    bbox: prediction.bbox,
                    time: currentTime
                });
            }
        });
        
        // Clean up old positions
        const currentTime = Date.now();
        for (const [id, data] of previousPositions.entries()) {
            if (currentTime - data.time > 5000) { // 5 seconds threshold
                previousPositions.delete(id);
            }
        }
    } catch (error) {
        console.error('Detection error:', error);
    }
}

// Helper function to calculate distance between two bounding boxes
function calculateDistance(bbox1, bbox2) {
    const center1 = {
        x: bbox1[0] + bbox1[2] / 2,
        y: bbox1[1] + bbox1[3] / 2
    };
    const center2 = {
        x: bbox2[0] + bbox2[2] / 2,
        y: bbox2[1] + bbox2[3] / 2
    };
    return Math.sqrt(
        Math.pow(center2.x - center1.x, 2) + 
        Math.pow(center2.y - center1.y, 2)
    );
}

// Show alert in the UI
function showAlert(message, type = 'info') {
    if (type === 'violation') {
        violationCount++;
        violationCountElement.textContent = violationCount;
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `violation-alert p-3 mb-2 rounded bg-gray-700 border-l-${type === 'violation' ? 'red' : type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue'}-500`;
    alertDiv.innerHTML = `
        <div class="flex items-start">
            <i class="fas fa-${type === 'violation' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : type === 'success' ? 'check-circle' : 'info-circle'} 
                mr-2 mt-1 text-${type === 'violation' ? 'red' : type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue'}-400"></i>
            <div>
                <p class="font-medium">${message}</p>
                <p class="text-xs text-gray-400">${new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    `;
    
    // Add to top of container
    if (alertsContainer.firstChild) {
        alertsContainer.insertBefore(alertDiv, alertsContainer.firstChild);
    } else {
        alertsContainer.appendChild(alertDiv);
    }
    
    // Auto-remove after 10 seconds (except violations)
    if (type !== 'violation') {
        setTimeout(() => {
            alertDiv.remove();
        }, 10000);
    }
}

// Fetch vehicle details from API
async function fetchVehicleDetails(plateNumber) {
    try {
        // This is a mock - replace with actual API call
        const mockData = {
            make: 'Toyota',
            model: 'Camry',
            year: '2020',
            color: 'Silver',
            owner: 'John Doe'
        };
        return mockData;
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
        return null;
    }
}

// Process number plate using OCR
async function processNumberPlate(image) {
    try {
        const { data: { text } } = await ocr.recognize(image);
        return text.replace(/\s+/g, '').toUpperCase();
    } catch (error) {
        console.error('OCR Error:', error);
        return null;
    }
}

// Log violation to localStorage
async function logViolation(violation) {
    // Add vehicle details if available
    if (violation.plateNumber) {
        violation.vehicleDetails = await fetchVehicleDetails(violation.plateNumber);
    }
    
    let violations = JSON.parse(localStorage.getItem('trafficViolations') || '[]');
    violations.push(violation);
    localStorage.setItem('trafficViolations', JSON.stringify(violations));
}

// Update uptime display
function updateUptime() {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    uptimeElement.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Event listeners
startBtn.addEventListener('click', startSystem);
stopBtn.addEventListener('click', stopSystem);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showAlert('System ready. Click "Start" to begin detection.', 'info');
});