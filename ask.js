const BACKEND_URL = "https://aib-io-t-backend-final.vercel.app"; // Replace with actual backend URL

// ✅ WebSocket for Real-Time Data Sources
const socket = new WebSocket("wss://aib-io-t-backend-final.vercel.app/ws/data-sources");

// 📡 Listen for Data Source Updates
socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data_sources)); // ✅ Sync with storage
    updateDataTableUI(data.data_sources);
};

socket.onerror = function (error) {
    console.error("WebSocket Error:", error);
};

// ✅ Function to Update the Data Table UI
function updateDataTableUI(dataSources) {
    const table = document.getElementById("data-table");
    table.innerHTML = ""; // Clear existing table

    dataSources.forEach(({ name, type, path }) => {
        updateDataTable(name, type, path, false);
    });
}

// 🏁 Ensure existing sources are loaded
document.addEventListener("DOMContentLoaded", function () {
    const storedSources = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    updateDataTableUI(storedSources);
});

// Handle Business Question Submission
document.getElementById("ask-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const question = document.getElementById("question").value;
    const responseSection = document.getElementById("response-section");
    const responseText = document.getElementById("response-text");

    responseSection.style.display = "block";
    responseText.innerText = "Loading...";

    fetch(`${BACKEND_URL}/ask-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
    })
    .then(response => response.json())
    .then(data => {
        responseText.innerText = data.answer;
    })
    .catch(error => {
        responseText.innerText = "Error: " + error;
    });
});

// Handle Data Source Connection
document.getElementById("connect-data-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("data-name").value;
    const type = document.getElementById("data-type").value;
    const path = document.getElementById("data-path").value;

    const response = await fetch(`${BACKEND_URL}/connect-data-source`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, path })
    });

    const result = await response.json();
    alert(result.message);
    updateDataTable(name, type, path);
});

const STORAGE_KEY = "connectedDataSources"; // LocalStorage Key

async function loadDataSourcesFromBackend() {
    try {
        const response = await fetch(`${BACKEND_URL}/list-data-sources`);
        const data = await response.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.sources)); // ✅ Sync storage with backend
        data.sources.forEach(({ name, type, path }) => updateDataTable(name, type, path, false));
    } catch (error) {
        console.error("Error loading data sources from backend:", error);
    }
}

// 🏁 Load sources on page load
document.addEventListener("DOMContentLoaded", function () {
    loadDataSourcesFromBackend(); // ✅ Syncs frontend with backend
});

// ✅ Load Data Sources from LocalStorage on Page Load
document.addEventListener("DOMContentLoaded", function () {
    const storedSources = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    storedSources.forEach(({ name, type, path }) => updateDataTable(name, type, path, false));
});

// ✅ Function to Update the Data Table and Save to LocalStorage
function updateDataTable(name, type, path, saveToStorage = true) {
    const table = document.getElementById("data-table");

    // Prevent duplicate entries
    for (let row of table.rows) {
        if (row.cells[0]?.innerText === name) return;
    }

    // Create new row
    const row = table.insertRow();
    row.insertCell(0).innerText = name;
    row.insertCell(1).innerText = type;
    row.insertCell(2).innerText = path;

    // ✅ Add Delete button
    const deleteCell = row.insertCell(3);
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "❌ Delete";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.padding = "5px";
    deleteButton.style.margin = "5px";
    deleteButton.style.backgroundColor = "#ff4d4d";
    deleteButton.style.border = "none";
    deleteButton.style.color = "white";
    deleteButton.style.borderRadius = "5px";

    // Attach event listener to remove row and update localStorage
    deleteButton.addEventListener("click", function () {
        if (confirm(`Are you sure you want to remove ${name}?`)) {
            row.remove();
            removeDataSourceFromStorage(name);
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

// ✅ Function to Remove a Data Source from LocalStorage
function removeDataSourceFromStorage(name) {
    let sources = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    sources = sources.filter(source => source.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
}

// 🏁 Ensure this function is called after adding a new data source
document.getElementById("connect-data-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("data-name").value.trim();
    const type = document.getElementById("data-type").value;
    const path = document.getElementById("data-path").value.trim();

    if (!name || !type || !path) {
        alert("All fields are required.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/connect-data-source`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, type, path })
        });

        if (!response.ok) throw new Error(`Server responded with ${response.status}`);

        const result = await response.json();
        alert(result.message || "Data source connected successfully.");

        updateDataTable(name, type, path);  // ✅ Call function after successful API response
    } catch (error) {
        alert(`Error: ${error.message || "Failed to connect to the server."}`);
    }
});

// Ensure IoT Device Option is Included in Dropdown
document.addEventListener("DOMContentLoaded", function () {
    const dataTypeDropdown = document.getElementById("data-type");
    if (!document.querySelector("#data-type option[value='iot']")) {
        let iotOption = document.createElement("option");
        iotOption.value = "iot";
        iotOption.innerText = "IoT Device";
        dataTypeDropdown.appendChild(iotOption);
    }
});
