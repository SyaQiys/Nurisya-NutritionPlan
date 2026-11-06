
console.log("NutritionPlan Daily Tracker Loaded");

const foodForm = document.getElementById("foodForm");
const recordList = document.getElementById("recordList");
const totalCalories = document.getElementById("totalCalories");
const totalMeals = document.getElementById("totalMeals");

const foodNameInput = document.getElementById("foodName");
const foodCaloriesInput = document.getElementById("foodCalories");
const mealTypeInput = document.getElementById("mealType");

// Get local date in YYYY-MM-DD format
function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Load saved records
let records = [];

try {
    const saved = JSON.parse(localStorage.getItem("foodRecords"));
    if (Array.isArray(saved)) {
        records = saved;
    }
} catch (error) {
    console.error("Unable to load records:", error);
}

// Existing records without a date are assigned to today
records = records.map(record => ({
    ...record,
    date: /^\d{4}-\d{2}-\d{2}$/.test(record.date || "")
        ? record.date
        : getToday()
}));

// Create date selector automatically
const dateSection = document.createElement("div");
dateSection.className = "date-section";
dateSection.innerHTML = `
    <h3>📅 Select Tracking Date</h3>
    <input type="date" id="trackingDate">
    <button type="button" id="todayBtn">Today</button>
    <p id="dateMessage"></p>
`;

recordList.parentNode.insertBefore(dateSection, recordList);

const trackingDate = document.getElementById("trackingDate");
const todayBtn = document.getElementById("todayBtn");
const dateMessage = document.getElementById("dateMessage");

trackingDate.value = getToday();

trackingDate.addEventListener("change", displayRecords);

todayBtn.addEventListener("click", function() {
    trackingDate.value = getToday();
    displayRecords();
});

foodForm.addEventListener("submit", function(event) {
    event.preventDefault();
    addRecord();
});

// CREATE

function addRecord() {

    const foodName = foodNameInput.value.trim();
    const calorieText = foodCaloriesInput.value.trim();
    const calories = Number(calorieText);
    const mealType = mealTypeInput.value;

    if (!foodName || calorieText === "" || !mealType) {
        alert("Please complete all fields.");
        return;
    }

    if (!Number.isFinite(calories) || calories < 0) {
        alert("Please enter valid calories.");
        return;
    }

    const editId = foodForm.dataset.editId;

    if (editId) {

        // UPDATE EXISTING RECORD
        const record = records.find(
            item => String(item.id) === editId
        );

        if (!record) {
            alert("Record not found.");
            return;
        }

        record.foodName = foodName;
        record.calories = calories;
        record.mealType = mealType;
        record.date = trackingDate.value;

        delete foodForm.dataset.editId;

    } else {

        // CREATE NEW RECORD
        if (!trackingDate.value) {
            alert("Please select a date.");
            return;
        }

        const record = {
            id: Date.now() + Math.random(),
            foodName: foodName,
            calories: calories,
            mealType: mealType,
            date: trackingDate.value
        };

        records.push(record);
    }

    saveRecords();
    displayRecords();
    foodForm.reset();

    const addBtn = document.getElementById("addBtn");

    if (addBtn) {
        addBtn.textContent = "Add Meal";
    }

    alert("Food record saved successfully!");
}


// SAVE
function saveRecords() {
    try {
        localStorage.setItem("foodRecords", JSON.stringify(records));
    } catch (error) {
        console.error("Save error:", error);
        alert("Unable to save records.");
    }
}

// READ
function displayRecords() {
    const selectedDate = trackingDate.value;

    const dailyRecords = records.filter(record =>
        record.date === selectedDate
    );

    dateMessage.textContent =
        selectedDate === getToday()
            ? "Showing today's meals"
            : `Showing meals for ${selectedDate}`;

    if (dailyRecords.length === 0) {
        recordList.innerHTML = `
            <div class="empty-state">
                <span>🍽️</span>
                <p>No meals recorded for this date.</p>
            </div>
        `;
    } else {
        let html = "";

        dailyRecords.forEach(record => {
            html += `
                <div class="record-item">
                    <h3>🍽️ ${escapeHTML(record.foodName)}</h3>
                    <p>🔥 ${record.calories} kcal</p>
                    <p>🍴 ${escapeHTML(record.mealType)}</p>
                    <p>📅 ${record.date}</p>

                    <div class="record-actions">
                        <button type="button"
                            onclick="editRecord(${record.id})">
                            ✏️ Edit
                        </button>

                        <button type="button"
                            onclick="deleteRecord(${record.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        });

        recordList.innerHTML = html;
    }

    calculateTotals(dailyRecords);
    displayHistory();
}

// CALCULATION
function calculateTotals(dailyRecords) {
    const total = dailyRecords.reduce(
        (sum, record) => sum + Number(record.calories),
        0
    );

    totalCalories.textContent =
        `${Number(total.toFixed(2))} kcal`;

    totalMeals.textContent =
        `${dailyRecords.length} ${dailyRecords.length === 1 ? "Meal" : "Meals"}`;
}

// UPDATE


function editRecord(id) {

    const record = records.find(item => item.id === id);

    if (!record) {
        alert("Food record not found.");
        return;
    }

    // Fill existing record into form
    foodNameInput.value = record.foodName;
    foodCaloriesInput.value = record.calories;
    mealTypeInput.value = record.mealType;

    // Allow editing the record date
    trackingDate.value = record.date;

    // Store the record ID being edited
    foodForm.dataset.editId = String(id);

    // Change button text
    const addBtn = document.getElementById("addBtn");

    if (addBtn) {
        addBtn.textContent = "Update Meal";
    }

    // Refresh selected date
    displayRecords();

    // Scroll to form
    foodForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// DELETE
function deleteRecord(id) {
    if (!confirm("Delete this food record?")) return;

    records = records.filter(record => record.id !== id);
    saveRecords();
    displayRecords();
}

// DAILY HISTORY
const historySection = document.createElement("section");
historySection.className = "history-section";

recordList.parentNode.insertBefore(
    historySection,
    recordList.nextSibling
);

function displayHistory() {
    const dailySummary = {};

    records.forEach(record => {
        if (!dailySummary[record.date]) {
            dailySummary[record.date] = {
                calories: 0,
                meals: 0
            };
        }

        dailySummary[record.date].calories += Number(record.calories);
        dailySummary[record.date].meals++;
    });

    let html = "<h3>📊 Daily Calorie History</h3>";

    const dates = Object.keys(dailySummary).sort().reverse();

    if (dates.length === 0) {
        html += "<p>No history available yet.</p>";
    }

    dates.forEach(date => {
        const summary = dailySummary[date];

        html += `
            <div class="history-item">
                <strong>📅 ${date}</strong>
                <p>🔥 ${Number(summary.calories.toFixed(2))} kcal</p>
                <p>🍽️ ${summary.meals} Meals</p>
                <button type="button"
                    onclick="viewDate('${date}')">
                    View Meals
                </button>
            </div>
        `;
    });

    historySection.innerHTML = html;
}

function viewDate(date) {
    trackingDate.value = date;
    displayRecords();
    dateSection.scrollIntoView({ behavior: "smooth" });
}

// SECURITY
function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return entities[character];
    });
}

// Auto-refresh date when user returns to the tab
document.addEventListener("visibilitychange", function() {
    if (!document.hidden && trackingDate.value === lastToday) {
        trackingDate.value = getToday();
        displayRecords();
    }
    lastToday = getToday();
});

let lastToday = getToday();

displayRecords();
