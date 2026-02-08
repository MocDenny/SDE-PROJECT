const axios = require("axios");

/**
 * @swagger
 * tags:
 *   - name: Recipe Retrieval
 *     description: Endpoints for retrieving recipes based on various criteria
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       description: Object representing a recipe
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the recipe
 *         type:
 *           type: string
 *           description: Type of the recipe (e.g., breakfast, lunch, etc.)
 *         calories:
 *           type: number
 *           description: Calories in the recipe
 *         ingredients:
 *           type: array
 *           items:
 *             type: object
 *             description: Ingredient object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the ingredient
 *               aisle:
 *                 type: string
 *                 description: Aisle where the ingredient can be found in the store
 *               amount:
 *                 type: number
 *                 description: Amount of the ingredient needed for the recipe
 *               unit:
 *                 type: string
 *                 description: Unit of measurement for the ingredient amount
 */

/**
 * @swagger
 * /recipes/{type}:
 *   get:
 *     tags:
 *       - Recipe Retrieval
 *     summary: Fetch random recipes from Spoonacular
 *     description: Retrieves recipes based on user preferences, including type, calorie range, diet, and intolerances.
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of recipe (e.g., breakfast, main_course)
 *       - in: query
 *         name: min_cal
 *         required: true
 *         schema:
 *           type: integer
 *         description: Minimum calories for the recipe
 *       - in: query
 *         name: max_cal
 *         required: true
 *         schema:
 *           type: integer
 *         description: Maximum calories for the recipe
 *       - in: query
 *         name: diet
 *         required: true
 *         schema:
 *           type: string
 *         description: User diet preference
 *       - in: query
 *         name: intolerances
 *         required: true
 *         schema:
 *           type: string
 *         description: User intolerances (comma-separated)
 *       - in: query
 *         name: number
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of recipes to fetch
 *     responses:
 *       200:
 *         description: Recipes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Bad request, missing parameters
 *       500:
 *         description: Service error
 */

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
                        unit: ing.unitShort,
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
