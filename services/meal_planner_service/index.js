const express = require("express");
const { get_meal_plan, save_meal_plan } = require("./controllers");

const app = express();
app.use(express.json());

// define route to get the meal plan
app.get("/plan", get_meal_plan);
// define route to save the meal plan
app.post("/plan", save_meal_plan);

app.listen(process.env.MEAL_PLANNER_PORT, function () {
    console.log(`Service listening on port ${process.env.MEAL_PLANNER_PORT}`);
});
