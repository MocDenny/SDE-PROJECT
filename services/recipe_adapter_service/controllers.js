const axios = require("axios");

const get_recipes = function (req, res) {
    // error handling
    if (
        !req.params.type ||
        !req.params.max_cal ||
        !req.params.min_cal ||
        !req.params.diet ||
        !req.params.intolerances ||
        !req.params.number
    ) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }

    // send requests to Spoonacular
    axios({
        method: "get",
        url: "https://api.spoonacular.com/recipes/complexSearch",
        params: {
            type: req.params.type,
            intolerances: req.params.intolerances,
            diet: req.params.diet,
            minCalories: req.params.min_cal,
            maxCalories: req.params.max_cal,
            number: req.params.number,
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
                    type: req.params.type,
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
