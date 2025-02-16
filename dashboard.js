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

// 🚀 Fetch Predictive Analytics Data
async function fetchPredictions() {
    const metric = document.getElementById("predict-metric").value;
    const days = parseInt(document.getElementById("predict-days").value, 10);

    if (days < 1 || days > 90) {
        alert("Please select a valid prediction period (1-90 days).");
        return;
    }

    const response = await fetch(`${BACKEND_URL}/predict-trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric, days })
    });

    const data = await response.json();
    updatePredictionChart(data.dates, data.values, metric);
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

// Auto-update every 5 seconds
setInterval(() => {
    fetchLatestIoTData();
    fetchMaintenancePrediction();
    fetchInventory();
    fetchRestockOrders();
    fetchIoTHistory();
}, 5000);
