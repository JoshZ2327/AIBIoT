const BACKEND_URL = "https://aib-io-t-backend-final.vercel.app"; // Replace with actual backend URL

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

// Update Connected Data Sources Table
function updateDataTable(name, type, path) {
    const table = document.getElementById("data-table");
    const row = table.insertRow();
    row.insertCell(0).innerText = name;
    row.insertCell(1).innerText = type;
    row.insertCell(2).innerText = path;
}

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
