const express = require("express");
const { get_recipes } = require("./controllers");

const app = express();
app.use(express.json());

// define routes
app.get("/recipes/:type/:min_cal/:max_cal/:diet/:intolerances/:number", get_recipes);

app.listen(process.env.RECIPE_ADAPTER_PORT, function () {
    console.log(`Service listening on port ${process.env.RECIPE_ADAPTER_PORT}`);
});
