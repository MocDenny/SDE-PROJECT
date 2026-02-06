const axios = require("axios");

const get_recipes = function (req, res) {
    console.log("Called /recipes with URL: " + req.url);
    // error handling
    if (
        !req.params.type ||
        !req.query.min_cal ||
        !req.query.max_cal ||
        !req.query.diet ||
        req.query.intolerances === undefined ||
        !req.query.number
    ) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }

    const type = req.params.type;
    const min_cal = req.query.min_cal;
    const max_cal = req.query.max_cal;
    const diet = req.query.diet;
    const intolerances = req.query.intolerances;
    const number = req.query.number;

    console.log(
        "Parameters received: " +
            type +
            ", " +
            min_cal +
            ", " +
            max_cal +
            ", " +
            diet +
            ", " +
            JSON.stringify(intolerances) +
            ", " +
            number,
    );

    // send requests to Spoonacular
    axios({
        method: "get",
        url: "https://api.spoonacular.com/recipes/complexSearch",
        params: {
            type: type,
            intolerances: intolerances,
            diet: diet,
            minCalories: min_cal,
            maxCalories: max_cal,
            number: number,
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
                    type: type,
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
                console.log("Error: " + JSON.stringify(error));
            } else if (error.request) {
                // no response received
                res.status(500).json("Spoonacular Service non responsive");
                console.log("Spoonacular Service non responsive. Error: ", JSON.stringify(error));
            } else {
                res.status(500).json("Error: " + error.message);
                console.log("Error: " + JSON.stringify(error));
            }
        },
    );
};

module.exports = { get_recipes };
