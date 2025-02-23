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

// ✅ Auto-update alerts at staggered intervals
setInterval(fetchAllAnomalies, 12000);

/** ✅ Function to Fetch AI-Powered Business Metrics */
let isFetchingMetrics = false;
async function fetchBusinessMetrics() {
    if (isFetchingMetrics) return;
    isFetchingMetrics = true;

    try {
        const response = await fetch(`${BACKEND_URL}/ai-dashboard`, { method: "POST" });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        document.getElementById("total-revenue").innerText = `$${data.revenue || 0}`;
        document.getElementById("new-users").innerText = data.users || 0;
        document.getElementById("traffic").innerText = data.traffic || 0;
    } catch (error) {
        console.error("❌ Error fetching business metrics:", error);
    } finally {
        isFetchingMetrics = false;
    }
}

// ✅ Auto-update metrics every 10 seconds
setInterval(fetchBusinessMetrics, 10000);

/** ✅ Function to Fetch AI-Powered Business Recommendations */
let isFetchingRecommendations = false;
async function fetchRecommendations() {
    if (isFetchingRecommendations) return;
    isFetchingRecommendations = true;

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
    } finally {
        isFetchingRecommendations = false;
    }
}

// ✅ Auto-update recommendations every 15 seconds
setInterval(fetchRecommendations, 15000);

/** ✅ Function to Fetch Predictive Analytics Data */
async function fetchPredictions() {
    const category = document.getElementById("predict-metric").value;
    const future_days = parseInt(document.getElementById("predict-days").value, 10);
    const model = document.getElementById("predict-model").value;

    if (future_days < 1 || future_days > 90) {
        alert("Please select a valid prediction period (1-90 days).");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/predict-trends`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, future_days, model })
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        updatePredictionChart(data.predicted_values, category);
    } catch (error) {
        console.error("❌ Error fetching predictions:", error);
    }
}

// ✅ Auto-update predictive analytics every 18 seconds
setInterval(fetchPredictions, 18000);

/** ✅ Function to Update Prediction Chart */
function updatePredictionChart(predictions, category) {
    const ctx = document.getElementById("predictionChart").getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: [...Array(predictions.length).keys()].map(day => `Day ${day + 1}`),
            datasets: [{
                label: `Predicted ${category} Trend`,
                data: predictions,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}
