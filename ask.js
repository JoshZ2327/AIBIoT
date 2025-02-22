const BACKEND_URL = "https://aib-io-t-backend-final.vercel.app"; // Replace with actual backend URL
const STORAGE_KEY = "connectedDataSources"; // LocalStorage Key

// ✅ Function to Connect to WebSocket (with Auto-Reconnect)
function connectWebSocket() {
    const socket = new WebSocket("wss://aib-io-t-backend-final.vercel.app/ws/data-sources");

    socket.onopen = () => console.log("✅ WebSocket connected.");
    
    socket.onclose = () => {
        console.warn("⚠️ WebSocket disconnected. Reconnecting in 3 seconds...");
        setTimeout(connectWebSocket, 3000);
    };
    
    socket.onerror = error => console.error("❌ WebSocket Error:", error);

    // 📡 Listen for Data Source Updates
    socket.onmessage = function (event) {
        try {
            const data = JSON.parse(event.data);
            if (data.type === "update" && data.data_sources) {  // ✅ Validate message type
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data_sources));
                updateDataTableUI(data.data_sources);
            } else {
                console.warn("⚠️ Unexpected WebSocket message:", data);
            }
        } catch (error) {
            console.error("❌ Error processing WebSocket message:", error);
        }
    };
}

// 🏁 Connect WebSocket when page loads
document.addEventListener("DOMContentLoaded", connectWebSocket);

// ✅ Function to Load Data Sources from Backend
async function loadDataSourcesFromBackend() {
    try {
        const response = await fetch(`${BACKEND_URL}/list-data-sources`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.sources));
        updateDataTableUI(data.sources);
    } catch (error) {
        console.error("❌ Error loading data sources from backend:", error);
    }
}

// 🏁 Load backend data first, then fallback to LocalStorage
document.addEventListener("DOMContentLoaded", async function () {
    await loadDataSourcesFromBackend();
    const storedSources = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    updateDataTableUI(storedSources);
});

// ✅ Function to Update the Data Table UI
function updateDataTableUI(dataSources) {
    const table = document.getElementById("data-table");
    table.innerHTML = ""; // Clear existing table

    dataSources.forEach(({ name, type, path }) => {
        updateDataTable(name, type, path, false);
    });
}

// ✅ Handle Business Question Submission
document.getElementById("ask-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const question = document.getElementById("question").value;
    const responseSection = document.getElementById("response-section");
    const responseText = document.getElementById("response-text");

    responseSection.style.display = "block";
    responseText.innerText = "⏳ Loading...";

    try {
        const response = await fetch(`${BACKEND_URL}/ask-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        responseText.innerText = data.answer;
    } catch (error) {
        responseText.innerText = "❌ Error: " + error;
    }
});

// ✅ Function to Update the Data Table
function updateDataTable(name, type, path, saveToStorage = true) {
    const table = document.getElementById("data-table");

    // Prevent duplicate entries
    for (let row of table.rows) {
        if (row.cells[0]?.innerText === name) return;
    }

    const row = table.insertRow();
    row.insertCell(0).innerText = name;
    row.insertCell(1).innerText = type;
    row.insertCell(2).innerText = path;

    // ✅ Add Delete button
    const deleteCell = row.insertCell(3);
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "❌ Delete";
    deleteButton.classList.add("delete-btn");

    deleteButton.addEventListener("click", async function () {
        if (confirm(`Are you sure you want to remove ${name}?`)) {
            try {
                const response = await fetch(`${BACKEND_URL}/delete-data-source/${name}`, {
                    method: "DELETE"
                });

                if (!response.ok) throw new Error(`Server error: ${response.status}`);

                console.log(`✅ Data source ${name} deleted. WebSocket will refresh UI.`);
            } catch (error) {
                console.error("❌ Error deleting data source:", error);
            }
        }
    });

    deleteCell.appendChild(deleteButton);

    // ✅ Save new entry to LocalStorage
    if (saveToStorage) {
        saveDataSourceToStorage(name, type, path);
    }
}

// ✅ Function to Save Data Sources to LocalStorage
function saveDataSourceToStorage(name, type, path) {
    let sources = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    sources.push({ name, type, path });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
}

// ✅ Ensure IoT Device Option is Included in Dropdown
document.addEventListener("DOMContentLoaded", function () {
    const dataTypeDropdown = document.getElementById("data-type");
    if (!document.querySelector("#data-type option[value='iot']")) {
        let iotOption = document.createElement("option");
        iotOption.value = "iot";
        iotOption.innerText = "IoT Device";
        dataTypeDropdown.appendChild(iotOption);
    }
});
