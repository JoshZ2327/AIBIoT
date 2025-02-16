const BACKEND_URL = "https://aibiot-backend.vercel.app"; // Replace with actual backend URL

// Sound Alerts
const alertSound = new Audio("sounds/alert.mp3"); // Add an alert sound file to your project
let soundEnabled = true; // Default setting: Sound alerts ON

// Alert Log Storage
let alertLog = [];

// Fetch Latest IoT Sensor Data
async function fetchLatestIoTData() {
    const response = await fetch(`${BACKEND_URL}/latest-iot-data`);
    const data = await response.json();
    document.getElementById("latest-data").innerText = JSON.stringify(data.latest_reading, null, 2);
}

// 🚨 Fetch AI-Powered Anomaly Detection
async function fetchAnomalies() {
    const category = document.getElementById("anomaly-category").value;

    const response = await fetch(`${BACKEND_URL}/detect-anomalies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category })
    });

    const data = await response.json();
    
    let anomaliesHTML = "<ul>";
    let warningMessage = "";

    data.anomalies.forEach(anomaly => {
        anomaliesHTML += `<li>⚠️ ${anomaly.value} (Score: ${anomaly.score})</li>`;
        if (anomaly.is_anomaly) {
            warningMessage = `⚠️ Anomaly detected in ${category}: ${anomaly.value}`;
            logAnomaly(category, anomaly.value, anomaly.score);
            if (soundEnabled) {
                alertSound.play(); // Play alert sound
            }
        }
    });
    anomaliesHTML += "</ul>";

    document.getElementById("anomaly-results").innerHTML = anomaliesHTML;

    // 🚨 Show Warning Banner
    if (warningMessage) {
        showWarning(warningMessage);
    }
}

// 📜 Log Anomalies in History
function logAnomaly(category, value, score) {
    const timestamp = new Date().toLocaleString();
    alertLog.push({ timestamp, category, value, score });

    // Keep only the last 10 logs
    if (alertLog.length > 10) {
        alertLog.shift();
    }

    updateAlertLog();
}

// 📜 Update Alert Log Table
function updateAlertLog() {
    let logHTML = "<tr><th>Timestamp</th><th>Category</th><th>Value</th><th>Score</th></tr>";
    alertLog.forEach(entry => {
        logHTML += `<tr><td>${entry.timestamp}</td><td>${entry.category}</td><td>${entry.value}</td><td>${entry.score}</td></tr>`;
    });
    document.getElementById("alert-log-table").innerHTML = logHTML;
}

// 🚨 Show Warning Banner
function showWarning(message) {
    document.getElementById("warning-message").innerText = message;
    document.getElementById("dashboard-warnings").classList.remove("hidden");
}

// 🚨 Dismiss Warning
function dismissWarning() {
    document.getElementById("dashboard-warnings").classList.add("hidden");
}

// 🎵 Toggle Sound Alerts
function toggleSoundAlerts() {
    soundEnabled = !soundEnabled;
    document.getElementById("sound-status").innerText = soundEnabled ? "🔊 ON" : "🔇 OFF";
}

// 🧹 Clear Alert Log
function clearAlertLog() {
    alertLog = [];
    updateAlertLog();
}

// 🔄 Auto-update every 5 seconds
setInterval(() => {
    fetchLatestIoTData();
    fetchAnomalies();
}, 5000);

// 🏁 Initial Fetch
updateAlertLog();
