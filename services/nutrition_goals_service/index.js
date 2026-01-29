const express = require("express");
const { get_info } = require("./controllers");

const app = express();
app.use(express.json());

// define route to get personalized nutrition goals (i.e calories division + diet + intolerances)
app.get("/goals/:email/:calories", get_info);

app.listen(process.env.NUTRITION_GOALS_PORT, function () {
    console.log(`Service listening on port ${process.env.NUTRITION_GOALS_PORT}`);
});
