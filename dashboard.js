const BACKEND_URL = "https://aibiot-backend.vercel.app"; // Replace with actual backend URL

// Sound Alerts
const alertSound = new Audio("sounds/alert.mp3"); // Add an alert sound file to your project
let soundEnabled = true; // Default setting: Sound alerts ON

// Alert Log Storage
let alertLog = [];

// Fetch Latest IoT Sensor Data
let isFetchingIoTData = false;
async function fetchLatestIoTData() {
    if (isFetchingIoTData) return; // ✅ Prevents duplicate requests
    isFetchingIoTData = true;

    try {
        const response = await fetch(`${BACKEND_URL}/latest-iot-data`);
        const data = await response.json();
        document.getElementById("latest-data").innerText = 
            data.latest_reading ? JSON.stringify(data.latest_reading, null, 2) : "No recent IoT data available.";
    } catch (error) {
        console.error("Error fetching IoT data:", error);
    } finally {
        isFetchingIoTData = false;
    }
}

// 🚨 Fetch AI-Powered Anomaly Detection
let isFetchingAnomalies = false;
async function fetchAnomalies() {
    if (isFetchingAnomalies) return;
    isFetchingAnomalies = true;

    try {
        const category = document.getElementById("anomaly-category").value;
        const response = await fetch(`${BACKEND_URL}/detect-anomalies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category })
        });

        const data = await response.json();
        document.getElementById("anomaly-results").innerHTML = 
            data.anomalies.length ? data.anomalies.map(a => `<li>⚠️ ${a.value} (Score: ${a.score})</li>`).join("") 
            : "<p>No anomalies detected.</p>";
    } catch (error) {
        console.error("Error fetching anomalies:", error);
    } finally {
        isFetchingAnomalies = false;
    }
}

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

// 🚀 Fetch Business Metrics
let isFetchingMetrics = false;
async function fetchBusinessMetrics() {
    if (isFetchingMetrics) return;
    isFetchingMetrics = true;

    try {
        const response = await fetch(`${BACKEND_URL}/ai-dashboard`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dateRange: 30, category: "all" })
        });

        const data = await response.json();
        document.getElementById("total-revenue").innerText = `$${data.revenue}`;
        document.getElementById("new-users").innerText = data.users;
        document.getElementById("traffic").innerText = data.traffic;
    } catch (error) {
        console.error("Error fetching business metrics:", error);
    } finally {
        isFetchingMetrics = false;
    }
}

// 📊 Update Business Charts
function updateBusinessCharts(data) {
    updateChart("revenueChart", "Revenue Trends", data.revenueTrends.dates, data.revenueTrends.values);
    updateChart("usersChart", "User Growth", data.userTrends.dates, data.userTrends.values);
    updateChart("trafficChart", "Traffic Trends", data.trafficTrends.dates, data.trafficTrends.values);
}

// 📈 Fetch Predictive Analytics Data
async function fetchPredictions() {
    const category = document.getElementById("predict-metric").value;
    const future_days = parseInt(document.getElementById("predict-days").value, 10);
    const model = document.getElementById("predict-model").value; // User-selected model

    if (future_days < 1 || future_days > 90) {
        alert("Please select a valid prediction period (1-90 days).");
        return;
    }

    const response = await fetch(`${BACKEND_URL}/predict-trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, future_days, model })
    });

    const data = await response.json();
    updatePredictionChart(
        data.predicted_trends.dates, 
        data.predicted_trends.values, 
        data.predicted_trends.lower_bounds, 
        data.predicted_trends.upper_bounds,
        category
    );
}

// 📊 Update Prediction Chart with Confidence Intervals
function updatePredictionChart(dates, values, lowerBounds, upperBounds, metric) {
    const ctx = document.getElementById("predictionChart").getContext("2d");

    if (window.predictionChartInstance) {
        window.predictionChartInstance.destroy();
    }

    window.predictionChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [
                {
                    label: `Predicted ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
                    data: values,
                    borderColor: "red",
                    fill: false
                },
                {
                    label: "Lower Bound",
                    data: lowerBounds,
                    borderColor: "green",
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: "Upper Bound",
                    data: upperBounds,
                    borderColor: "blue",
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        }
    });
}

// 🚨 Fetch AI-Powered Alerts & Notifications
let isFetchingAlerts = false;
async function fetchAlerts() {
    if (isFetchingAlerts) return;
    isFetchingAlerts = true;

    try {
        const response = await fetch(`${BACKEND_URL}/check-alerts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        if (data.alerts_sent.length > 0) {
            displayWarning(data.alerts_sent);
        }
    } catch (error) {
        console.error("Error fetching alerts:", error);
    } finally {
        isFetchingAlerts = false;
    }
}
    const data = await response.json();
    if (data.alerts_sent.length > 0) {
        displayWarning(data.alerts_sent);
    }
}

// 🚨 Display Warnings on Dashboard
function displayWarning(warnings) {
    const warningSection = document.getElementById("dashboard-warnings");
    const warningMessage = document.getElementById("warning-message");

    warningMessage.innerHTML = warnings.join("<br>");
    warningSection.classList.remove("hidden");
}

// 🔄 Auto-update every 5 seconds
setInterval(() => {
    fetchLatestIoTData();
    fetchAnomalies();
    fetchBusinessMetrics();
    fetchAlerts();
}, 5000);

// 🏁 Initial Fetch
updateAlertLog();
fetchBusinessMetrics();
fetchAlerts();

setInterval(fetchLatestIoTData, 5000);
setInterval(fetchAnomalies, 7000);
setInterval(fetchBusinessMetrics, 10000);
setInterval(fetchAlerts, 12000);
