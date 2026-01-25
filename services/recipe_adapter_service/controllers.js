const axios = require("axios");

const get_recipes = function (req, res) {
    // error handling
    const a = !req.query.min_cal;
    const b = !req.query.max_cal;
    const c = !req.query.diet;
    const d = !req.query.intolerances;
    const e = !req.query.number;
    if (
        !req.query.type ||
        !req.query.max_cal ||
        !req.query.min_cal ||
        !req.query.diet ||
        !req.query.intolerances ||
        !req.query.number
    ) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }

    // send requests to Spoonacular
    axios({
        method: "get",
        url: "https://api.spoonacular.com/recipes/complexSearch",
        params: {
            type: req.query.type,
            intolerances: req.query.intolerances,
            diet: req.query.diet,
            minCalories: req.query.min_cal,
            maxCalories: req.query.max_cal,
            number: req.query.number,
            sort: "random",
            fillIngredients: true,
            apiKey: process.env.API_KEY,
        },
    }).then(
        function (resp) {
            // return only needed information
            let recipes = [];
            for (const recipe of resp.data.results) {
                // extract inredient information
                let ingredient_list = [];
                for (const ing of recipe.missedIngredients) {
                    ingredient_list.push({
                        amount: ing.amount,
                        unit: ing.unit,
                        name: ing.originalName,
                        aisle: ing.aisle,
                    });
                }
                recipes.push({
                    name: recipe.title,
                    type: req.query.type,
                    calories: recipe.nutrition.nutrients[0].amount,
                    ingredients: ingredient_list,
                });
            }
            res.status(200).json(recipes);
        },
        // handle errors
        function (error) {
            if (error.response) {
                // service responded with a status code
                res.status(error.response.status).json(error.response.data);
            } else if (error.request) {
                // no response received
                res.status(500).json("Spoonacular Service non responsive");
            } else {
                res.status(500).json("Error: " + error.message);
            }
        },
    );
};

module.exports = { get_recipes };
