const BACKEND_URL = "https://aibiot-backend.vercel.app"; // Replace with actual backend URL

// 🎵 Sound Alerts
const alertSound = new Audio("sounds/alert.mp3");
let soundEnabled = true;
let alertLog = [];
let socket; // WebSocket for IoT Streaming

/** ✅ Function to Connect to WebSocket for Real-Time IoT Data */
function connectIoTWebSocket() {
    socket = new WebSocket("wss://aibiot-backend.vercel.app/ws/iot");

    socket.onopen = () => console.log("✅ WebSocket connected for real-time IoT data.");

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.sensor && data.value) {
                updateIoTDataDisplay(data);

                // ✅ Handle Anomaly Detection Alerts
                if (data.anomaly_detected) {
                    displayAnomalyAlert(data);
                }
            } else {
                console.warn("⚠️ Unexpected IoT data format:", data);
            }
        } catch (error) {
            console.error("❌ Error processing WebSocket message:", error);
        }
    };

    socket.onerror = (error) => console.error("❌ WebSocket Error:", error);

    socket.onclose = () => {
        console.warn("⚠️ WebSocket disconnected. Reconnecting in 3 seconds...");
        setTimeout(connectIoTWebSocket, 3000);
    };
}

/** ✅ Function to Display Anomaly Alert */
function displayAnomalyAlert(data) {
    const { sensor, value, timestamp, anomaly_score, status } = data;

    // 🔔 Display Alert in UI
    const alertBox = document.getElementById("anomaly-alerts");
    alertBox.classList.remove("hidden");
    alertBox.innerHTML = `
        🚨 <strong>IoT Anomaly Detected!</strong> 
        <br>Sensor: ${sensor}
        <br>Value: ${value}
        <br>Timestamp: ${new Date(timestamp).toLocaleTimeString()}
        <br>Risk Level: <strong>${status}</strong> (Score: ${anomaly_score})
    `;

    // 🔊 Play Alert Sound if Enabled
    playAlertSound();

    // 📝 Log the Alert
    alertLog.push({ sensor, value, timestamp, anomaly_score, status });

    // Auto-hide after 10 seconds
    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 10000);
}

/** ✅ Function to Fetch and Display IoT Anomaly History */
async function fetchAnomalyHistory() {
    try {
        const response = await fetch(`${BACKEND_URL}/fetch-anomalies`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        const anomalies = data.anomalies || [];

        const anomalyList = document.getElementById("anomaly-history");
        anomalyList.innerHTML = anomalies.length
            ? anomalies.map(a => `<li>🚨 ${a.sensor}: ${a.value} | ${a.timestamp}</li>`).join("")
            : "<p>No anomalies detected.</p>";
    } catch (error) {
        console.error("❌ Error fetching anomalies:", error);
    }
}

// ✅ Auto-load Anomaly History on Page Load
document.addEventListener("DOMContentLoaded", fetchAnomalyHistory);

/** ✅ Function to Fetch and Display All Anomalies (IoT + Business) */
async function fetchAllAnomalies() {
    try {
        // Fetch business anomalies
        const businessResponse = await fetch(`${BACKEND_URL}/check-alerts`);
        if (!businessResponse.ok) throw new Error(`Server error: ${businessResponse.status}`);
        const businessData = await businessResponse.json();
        const businessAlerts = businessData.alerts || [];

        // Fetch IoT anomalies
        const iotResponse = await fetch(`${BACKEND_URL}/fetch-anomalies`);
        if (!iotResponse.ok) throw new Error(`Server error: ${iotResponse.status}`);
        const iotData = await iotResponse.json();
        const iotAlerts = iotData.anomalies || [];

        // Merge both alerts
        const allAlerts = [...businessAlerts, ...iotAlerts];

        // Display all anomalies at the top
        if (allAlerts.length > 0) {
            displayWarning(allAlerts);
        }
    } catch (error) {
        console.error("❌ Error fetching anomalies:", error);
    }
}

// ✅ Auto-fetch anomalies on page load
document.addEventListener("DOMContentLoaded", fetchAllAnomalies);

/** ✅ Function to Show Anomalies in the UI */
function displayWarning(warnings) {
    const warningMessage = document.getElementById("warning-message");
    const dashboardWarnings = document.getElementById("dashboard-warnings");

    // Format and display all alerts inside the existing UI
    warningMessage.innerHTML = warnings
        .map(alert => `🚨 ${alert.category || alert.sensor}: ${alert.value || alert.message} | ${alert.timestamp}`)
        .join("<br>");

    dashboardWarnings.classList.remove("hidden");
}

// 🚨 Dismiss Warning
function dismissWarning() {
    document.getElementById("dashboard-warnings").classList.add("hidden");
}

/** ✅ Function to Update IoT Data in the UI */
function updateIoTDataDisplay(sensorData) {
    const { timestamp, sensor, value } = sensorData;
    document.getElementById("latest-data").innerText = 
        `📡 ${sensor} - ${value} | 🕒 ${new Date(timestamp).toLocaleTimeString()}`;

    updateIoTChart(sensor, value);
}

/** ✅ Function to Update IoT Data Chart */
function updateIoTChart(sensor, value) {
    if (!window.iotChart) return;

    const timeLabel = new Date().toLocaleTimeString();
    if (window.iotChart.data.labels.length > 10) {
        window.iotChart.data.labels.shift();
        window.iotChart.data.datasets[0].data.shift();
    }

    window.iotChart.data.labels.push(timeLabel);
    window.iotChart.data.datasets[0].data.push(value);
    window.iotChart.update();
}

/** ✅ Function to Fetch AI-Powered Business Metrics */
async function fetchBusinessMetrics() {
    try {
        const response = await fetch(`${BACKEND_URL}/ai-dashboard`, { method: "POST" });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        document.getElementById("total-revenue").innerText = `$${data.revenue || 0}`;
        document.getElementById("new-users").innerText = data.users || 0;
        document.getElementById("traffic").innerText = data.traffic || 0;
    } catch (error) {
        console.error("❌ Error fetching business metrics:", error);
    }
}

/** ✅ Function to Fetch AI-Powered Business Recommendations */
async function fetchRecommendations() {
    try {
        const category = document.getElementById("predict-metric").value;
        const response = await fetch(`${BACKEND_URL}/get-recommendations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category })
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        const recommendations = data.recommendations || [];

        document.getElementById("recommendations-section").innerHTML =
            recommendations.length
                ? recommendations.map(r => `<li>✅ ${r}</li>`).join("")
                : "<p>No recommendations available.</p>";
    } catch (error) {
        console.error("❌ Error fetching recommendations:", error);
    }
}

// ✅ Auto-update at staggered intervals
setInterval(fetchBusinessMetrics, 10000);
setInterval(fetchAllAnomalies, 12000);
setInterval(fetchRecommendations, 15000);
