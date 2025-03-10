const BACKEND_URL = "https://aibiot-backend.vercel.app"; // Replace with actual backend URL

// ✅ AI Model Selection Logic
document.addEventListener("DOMContentLoaded", function () {
    const aiModelDropdown = document.getElementById("ai-model");
    const aiModelStatus = document.getElementById("ai-model-status");

    // ✅ Load the saved AI model from localStorage (if it exists)
    const savedModel = localStorage.getItem("selectedAIModel");
    if (savedModel) {
        aiModelDropdown.value = savedModel;
    }

    // ✅ Function to save AI model selection
    window.saveAIModel = function () {
        const selectedModel = aiModelDropdown.value;
        localStorage.setItem("selectedAIModel", selectedModel);
        aiModelStatus.textContent = `✅ Saved: ${selectedModel}`;
    };

    // ✅ Attach event listener to dropdown (optional: auto-save on change)
    aiModelDropdown.addEventListener("change", saveAIModel);
});

// ✅ Function to get the selected AI model when making predictions
function getSelectedAIModel() {
    return localStorage.getItem("selectedAIModel") || "auto"; // Default to auto selection
}

// ✅ Example: Modify fetch request to send selected AI model
function fetchPredictions() {
    const selectedModel = getSelectedAIModel();
    const metric = document.getElementById("predict-metric").value;
    const days = document.getElementById("predict-days").value;

    fetch(`${BACKEND_URL}/predict-trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            category: metric,
            future_days: parseInt(days),
            model: selectedModel
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Prediction Results:", data);
        alert(`Predictions received for ${metric} using ${selectedModel}!`);
    })
    .catch(error => console.error("Error fetching predictions:", error));
}

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

async function fetchAnomalyExplanations() {
    try {
        const response = await fetch(`${BACKEND_URL}/get-anomaly-explanations`);
        const data = await response.json();

        if (data.explanations.length > 0) {
            displayAnomalyExplanations(data.explanations);
        } else {
            document.getElementById("anomaly-explanations").innerHTML = "<p>✅ No recent anomalies detected.</p>";
        }
    } catch (error) {
        console.error("❌ Error fetching AI anomaly explanations:", error);
        document.getElementById("anomaly-explanations").innerHTML = "<p>⚠️ Failed to load anomaly insights.</p>";
    }
}

// ✅ Auto-load Anomaly Explanations on Page Load
document.addEventListener("DOMContentLoaded", function () {
    fetchAnomalyHistory(); 
    fetchAnomalyExplanations(); // 🔹 Make sure it's called here
});
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

// ✅ Fetch AI-Adjusted IoT Automation Thresholds
async function fetchAIThresholds() {
    try {
        const response = await fetch(`${BACKEND_URL}/get-digital-twins`);
        const data = await response.json();

        const thresholdSection = document.getElementById("ai-thresholds");
        if (data.digital_twins.length > 0) {
            thresholdSection.innerHTML = data.digital_twins
                .map(dt => `<p>⚙️ ${dt.asset_name}: <strong>${dt.ai_thresholds.adjusted_threshold || "N/A"}</strong></p>`)
                .join("");
        } else {
            thresholdSection.innerHTML = "<p>✅ No AI thresholds available.</p>";
        }
    } catch (error) {
        console.error("❌ Error fetching AI thresholds:", error);
        document.getElementById("ai-thresholds").innerHTML = "<p>⚠️ Failed to load AI thresholds.</p>";
    }
}

// ✅ Auto-fetch AI Thresholds when Dashboard Loads
document.addEventListener("DOMContentLoaded", fetchAIThresholds);

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

// ✅ Fetch and Display AI-Adjusted IoT Thresholds
async function fetchAIThresholds() {
    try {
        const response = await fetch(`${BACKEND_URL}/get-ai-thresholds`);
        const data = await response.json();

        const thresholdSection = document.getElementById("ai-thresholds");
        if (data.thresholds.length > 0) {
            thresholdSection.innerHTML = data.thresholds
                .map(th => `<p>⚙️ ${th.sensor}: <strong>${th.adjusted_threshold}</strong></p>`)
                .join("");
        } else {
            thresholdSection.innerHTML = "<p>✅ No AI thresholds available.</p>";
        }
    } catch (error) {
        console.error("❌ Error fetching AI thresholds:", error);
        document.getElementById("ai-thresholds").innerHTML = "<p>⚠️ Failed to load AI thresholds.</p>";
    }
}

// ✅ Auto-load AI Thresholds on Page Load
document.addEventListener("DOMContentLoaded", fetchAIThresholds);

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

/** ✅ IoT Automation Rules */
function openAutomationModal() {
    document.getElementById("automation-modal").classList.remove("hidden");
}

function saveAutomationRule() {
    const triggerCondition = document.getElementById("trigger-condition").value.trim();
    const automationAction = document.getElementById("automation-action").value.trim();

    if (!triggerCondition || !automationAction) {
        alert("⚠️ Please enter a valid condition and action.");
        return;
    }

    let rules = JSON.parse(localStorage.getItem("automationRules")) || [];

    // Prevent duplicate rules
    if (rules.some(rule => rule.trigger === triggerCondition && rule.action === automationAction)) {
        alert("⚠️ This rule already exists.");
        return;
    }

    const rule = { trigger: triggerCondition, action: automationAction };
    rules.push(rule);
    localStorage.setItem("automationRules", JSON.stringify(rules));

    displayAutomationRules();
    document.getElementById("trigger-condition").value = "";
    document.getElementById("automation-action").value = "";
    document.getElementById("automation-modal").classList.add("hidden");
}

function displayAutomationRules() {
    const rulesList = document.getElementById("automation-rules-list");
    rulesList.innerHTML = "";

    let rules = JSON.parse(localStorage.getItem("automationRules")) || [];

    if (rules.length === 0) {
        rulesList.innerHTML = "<p>No automation rules created.</p>";
        return;
    }

    rules.forEach((rule, index) => {
        const ruleItem = document.createElement("div");
        ruleItem.classList.add("automation-rule-item");
        ruleItem.innerHTML = `
            <p><strong>Trigger:</strong> ${rule.trigger}</p>
            <p><strong>Action:</strong> ${rule.action}</p>
            <button onclick="deleteAutomationRule(${index})">🗑️ Remove</button>
        `;
        rulesList.appendChild(ruleItem);
    });
}

function deleteAutomationRule(index) {
    let rules = JSON.parse(localStorage.getItem("automationRules")) || [];
    rules.splice(index, 1);
    localStorage.setItem("automationRules", JSON.stringify(rules));
    displayAutomationRules();
}

// ✅ Load Automation Rules on Page Load
document.addEventListener("DOMContentLoaded", displayAutomationRules);

// ✅ Voice Command for IoT Actions
function startVoiceCommand() {
    const voiceStatus = document.getElementById("voice-command-status");

    if (!('webkitSpeechRecognition' in window)) {
        voiceStatus.textContent = "❌ Voice recognition not supported in this browser.";
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = function () {
        voiceStatus.textContent = "🎙️ Listening...";
    };

    recognition.onresult = function (event) {
        const command = event.results[0][0].transcript;
        voiceStatus.textContent = `✅ Recognized: "${command}"`;

        // Send command to backend
        fetch(`${BACKEND_URL}/voice-command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command }),
        })
        .then(response => response.json())
        .then(data => {
            voiceStatus.textContent = `✅ Action: ${data.message}`;
        })
        .catch(error => {
            voiceStatus.textContent = "❌ Error processing command.";
            console.error("Voice Command Error:", error);
        });
    };

    recognition.onerror = function (event) {
        voiceStatus.textContent = "❌ Voice recognition error.";
        console.error("Voice Recognition Error:", event);
    };

    recognition.start();
}

// ✅ Auto-update at staggered intervals
setInterval(fetchBusinessMetrics, 10000);
setInterval(fetchAllAnomalies, 12000);
setInterval(fetchRecommendations, 15000);
