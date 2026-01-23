const express = require('express');
const {get_meal_plan} = require('./controllers');

const app = express();
app.use(express.json())

// define route to get the meal plan
app.get("/meal_plan", get_meal_plan)
// define route to save the meal plan
app.post("/meal_plan", )

app.listen(3000, function () {
    console.log("Service listening on port 3000");
});