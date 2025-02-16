const BACKEND_URL = "https://aibiot-backend.vercel.app"; // Replace with actual backend URL

// Fetch Latest IoT Sensor Data
async function fetchLatestIoTData() {
    const response = await fetch(`${BACKEND_URL}/latest-iot-data`);
    const data = await response.json();
    document.getElementById("latest-data").innerText = JSON.stringify(data.latest_reading, null, 2);
}

// Fetch AI-Powered Maintenance Prediction
async function fetchMaintenancePrediction() {
    const response = await fetch(`${BACKEND_URL}/predict-maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensor_type: "temperature" })
    });
    const data = await response.json();
    document.getElementById("maintenance-date").innerText = data.next_maintenance || "N/A";
}

// Fetch Spare Parts Inventory
async function fetchInventory() {
    const response = await fetch(`${BACKEND_URL}/check-inventory`);
    const data = await response.json();
    let inventoryHTML = "";
    data.restock_recommendations.forEach(part => {
        inventoryHTML += `<p>🔧 ${part.part_name} - Stock: ${part.current_stock} - Suggest Reorder: ${part.recommended_order_quantity} from ${part.supplier}</p>`;
    });
    document.getElementById("inventory-section").innerHTML = inventoryHTML;
}

// Fetch AI-Generated Restock Orders
async function fetchRestockOrders() {
    const response = await fetch(`${BACKEND_URL}/generate-restock-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part_name: "Motor Bearings" }) // Example part name
    });
    const data = await response.json();
    document.getElementById("restock-orders-section").innerHTML = `<p>📦 ${data.message}</p>`;
}

// Fetch Historical IoT Data and Plot Chart
async function fetchIoTHistory() {
    const response = await fetch(`${BACKEND_URL}/iot-history`);
    const data = await response.json();
    const labels = data.history.map(entry => new Date(entry.timestamp).toLocaleTimeString());
    const values = data.history.map(entry => entry.value);

    new Chart(document.getElementById('iotChart').getContext('2d'), {
        type: 'line',
        data: { labels, datasets: [{ label: 'IoT Sensor Data', data: values, borderColor: 'blue', fill: false }] }
    });
}

// 🚀 Fetch AI-Powered Business Metrics
async function fetchBusinessMetrics() {
    const response = await fetch(`${BACKEND_URL}/ai-dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateRange: 30, category: "all" })
    });

    const data = await response.json();
    document.getElementById("total-revenue").innerText = `$${data.revenue}`;
    document.getElementById("new-users").innerText = data.users;
    document.getElementById("traffic").innerText = data.traffic;

    updateBusinessCharts(data);
}

// 📊 Update Business Charts
function updateBusinessCharts(data) {
    updateChart("revenueChart", "Revenue Trends", data.revenueTrends.dates, data.revenueTrends.values);
    updateChart("usersChart", "User Growth", data.userTrends.dates, data.userTrends.values);
    updateChart("trafficChart", "Traffic Trends", data.trafficTrends.dates, data.trafficTrends.values);
}

// 📊 Generic Chart Updater
function updateChart(chartId, label, dates, values) {
    const ctx = document.getElementById(chartId).getContext("2d");

    if (window[chartId]) {
        window[chartId].destroy();
    }

    window[chartId] = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: label,
                data: values,
                borderColor: "blue",
                fill: false
            }]
        }
    });
}

// 🔮 Fetch Predictive Analytics Data
async function fetchPredictions() {
    const category = document.getElementById("predict-metric").value;
    const future_days = parseInt(document.getElementById("predict-days").value, 10);

    if (future_days < 1 || future_days > 90) {
        alert("Please select a valid prediction period (1-90 days).");
        return;
    }

    const response = await fetch(`${BACKEND_URL}/predict-trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, future_days })
    });

    const data = await response.json();
    updatePredictionChart(data.predicted_trends.dates, data.predicted_trends.values, category);
}

// 📊 Update Prediction Chart
function updatePredictionChart(dates, values, metric) {
    const ctx = document.getElementById("predictionChart").getContext("2d");

    if (window.predictionChartInstance) {
        window.predictionChartInstance.destroy();
    }

    window.predictionChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: `Predicted ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
                data: values,
                borderColor: "red",
                fill: false
            }]
        }
    });
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
    data.anomalies.forEach(anomaly => {
        anomaliesHTML += `<li>⚠️ ${anomaly}</li>`;
    });
    anomaliesHTML += "</ul>";

    document.getElementById("anomaly-results").innerHTML = anomaliesHTML;
}

// 🚀 Fetch AI-Powered Recommendations
async function fetchRecommendations() {
    const category = document.getElementById("predict-metric").value;
    const future_days = parseInt(document.getElementById("predict-days").value, 10);

    const response = await fetch(`${BACKEND_URL}/ai-recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, future_days })
    });

    const data = await response.json();

    let recommendationsHTML = "<ul>";
    data.recommendations.forEach(rec => {
        recommendationsHTML += `<li>📌 ${rec}</li>`;
    });
    recommendationsHTML += "</ul>";

    document.getElementById("recommendations-section").innerHTML = recommendationsHTML;
}

// 🔄 Auto-update every 5 seconds
setInterval(() => {
    fetchLatestIoTData();
    fetchMaintenancePrediction();
    fetchInventory();
    fetchRestockOrders();
    fetchIoTHistory();
    fetchBusinessMetrics();
}, 5000);

// 🏁 Initial Fetch
fetchBusinessMetrics();
fetchRecommendations();
