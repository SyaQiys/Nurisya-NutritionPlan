

console.log("NutritionPlan Dashboard Loaded");


// =====================================
// GET HTML ELEMENTS
// =====================================

const foodInput = document.getElementById("foodInput");
const searchBtn = document.getElementById("searchBtn");
const foodResult = document.getElementById("foodResult");

const dietType = document.getElementById("dietType");
const suggestBtn = document.getElementById("suggestBtn");
const suggestionResult = document.getElementById("suggestionResult");


// =====================================
// EVENT LISTENERS
// =====================================

// Search using button
searchBtn.addEventListener("click", searchFood);

// Search using Enter key
foodInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchFood();
    }
});

// Get diet recommendation
suggestBtn.addEventListener("click", getRecommendation);

const API_KEY = "kk8NcMJJ6dmdqDGwnkktPnjnTdcTP6qKpWnqCJJc";
// =====================================
// SEARCH FOOD NUTRITION
// =====================================

async function searchFood() {

    const foodName = foodInput.value.trim();

    if (foodName === "") {

        foodResult.innerHTML = `
            <p style="color:#d9534f;">
                ⚠️ Please enter a food name.
            </p>
        `;

        foodInput.focus();
        return;
    }

    // Show loading message
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    foodResult.innerHTML = `
        <p>🔍 Searching for ${escapeHTML(foodName)}...</p>
    `;

    try {

        const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodName}&api_key=${API_KEY}`
);

const data = await response.json();

if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
}

if (!data.foods || data.foods.length === 0) {

    foodResult.innerHTML = `
        <p style="color:#d9534f;">
            No food information found.
        </p>
    `;

    return;
}

const food = data.foods[0];

let calories = "N/A";
let protein = "N/A";
let carbs = "N/A";
let fat = "N/A";

food.foodNutrients.forEach(nutrient => {

    if (nutrient.nutrientName === "Energy") {
        calories = nutrient.value;
    }

    if (nutrient.nutrientName === "Protein") {
        protein = nutrient.value;
    }

    if (nutrient.nutrientName === "Carbohydrate, by difference") {
        carbs = nutrient.value;
    }

    if (nutrient.nutrientName === "Total lipid (fat)") {
        fat = nutrient.value;
    }
});


        // Display nutrition information

        foodResult.innerHTML = `

            <h3 style="color:#267447; margin-bottom:15px;">
                🍎 ${escapeHTML(food.description)}
            </h3>

            <div class="nutrition-info">

                <p>
                    🔥 <strong>Calories:</strong>
                    ${calories} kcal
                </p>

                <p>
                    💪 <strong>Protein:</strong>
                    ${protein} g
                </p>

                <p>
                    🍞 <strong>Carbohydrates:</strong>
                    ${carbs} g
                </p>

                <p>
                    🥑 <strong>Fat:</strong>
                    ${fat} g
                </p>

            </div>

            <p style="font-size:11px; color:#999; margin-top:12px;">
               Nutrition information retrieved from USDA FoodData Central API.
            </p>

        `;

    }

    catch (error) {

        console.error("Food Search Error:", error);

        foodResult.innerHTML = `
            <p style="color:#d9534f;">
                Unable to retrieve food information.
                Please try again.
            </p>
        `;

    }

    finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "Search";

    }

}


// =====================================
// DIET RECOMMENDATION
// =====================================

function getRecommendation() {

    const selectedDiet = dietType.value;

    let recommendation = [];


    // Check selected diet

    if (selectedDiet === "") {

        suggestionResult.innerHTML = `
            <p style="color:#d9534f;">
                ⚠️ Please select a diet goal first.
            </p>
        `;

        return;
    }


    // Weight Loss

    if (selectedDiet === "weightloss") {

        recommendation = [
            {
                name: "Apple",
                description: "A fruit rich in fibre."
            },
            {
                name: "Broccoli",
                description: "Contains fibre and vitamins."
            },
            {
                name: "Oats",
                description: "A source of fibre and energy."
            }
        ];

    }


    // Muscle Gain

    else if (selectedDiet === "musclegain") {

        recommendation = [
            {
                name: "Chicken Breast",
                description: "A good source of lean protein."
            },
            {
                name: "Eggs",
                description: "Provide protein and nutrients."
            },
            {
                name: "Salmon",
                description: "Contains protein and healthy fats."
            }
        ];

    }


    // Healthy Living

    else if (selectedDiet === "healthy") {

        recommendation = [
            {
                name: "Banana",
                description: "Contains potassium and fibre."
            },
            {
                name: "Spinach",
                description: "Rich in vitamins and minerals."
            },
            {
                name: "Orange",
                description: "A source of vitamin C."
            }
        ];

    }


    // Display recommendations

    let output = `
        <h3 style="color:#267447; margin-bottom:15px;">
            🌱 Recommended Foods
        </h3>
    `;

    recommendation.forEach(function(food) {

        output += `

            <div style="
                background:#ffffff;
                padding:12px;
                border-radius:9px;
                margin-bottom:10px;
                border:1px solid #e1eee2;
            ">

                <strong>🥗 ${food.name}</strong>

                <p style="
                    font-size:13px;
                    color:#7b8a7e;
                    margin-top:4px;
                ">
                    ${food.description}
                </p>

            </div>

        `;

    });


    suggestionResult.innerHTML = output;


    // Save selected recommendation

    try {

       const savedRecommendation = {
            diet: selectedDiet,
            foods: recommendation,
            date: new Date().toLocaleDateString()
        };

        localStorage.setItem(
            "latestSuggestion",
            JSON.stringify(savedRecommendation)
        );

    }

    catch (error) {

        console.error("Unable to save recommendation:", error);

    }

}


// =====================================
// RESTORE LAST RECOMMENDATION
// =====================================

function loadLatestSuggestion() {

    try {

        const savedData = localStorage.getItem("latestSuggestion");

        if (savedData) {

            const data = JSON.parse(savedData);

            dietType.value = data.diet;

            let output = `
                <h3 style="color:#267447; margin-bottom:15px;">
                    🌱 Your Saved Recommendations
                </h3>

                <p style="font-size:12px; color:#999; margin-bottom:12px;">
                    Saved on: ${escapeHTML(data.date)}
                </p>
            `;

            data.foods.forEach(function(food) {

                output += `
                    <div style="
                        background:#ffffff;
                        padding:12px;
                        border-radius:9px;
                        margin-bottom:10px;
                        border:1px solid #e1eee2;
                    ">
                        <strong>🥗 ${escapeHTML(food.name)}</strong>

                        <p style="font-size:13px; color:#7b8a7e;">
                            ${escapeHTML(food.description)}
                        </p>
                    </div>
                `;

            });

            suggestionResult.innerHTML = output;

        }

    }

    catch (error) {

        console.error("Unable to load saved recommendation:", error);

    }

}


// =====================================
// PREVENT HTML INJECTION
// =====================================

function escapeHTML(text) {

    return String(text).replace(/[&<>"']/g, function(character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}


// =====================================
// INITIALIZE DASHBOARD
// =====================================

loadLatestSuggestion();
