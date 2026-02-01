// recipes controllers
const { recipe_model } = require("./model/recipe.js");
const { meal_plan_model } = require("./model/meal_plan.js");

/**
 * @swagger
 * /recipe:
 *   post:
 *     summary: Add a new recipe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the recipe
 *               type:
 *                 type: string
 *                 description: Type of the recipe (e.g., breakfast, lunch, etc.)
 *               calories:
 *                 type: number
 *                 description: Calories in the recipe
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of ingredients
 *     responses:
 *       200:
 *         description: Recipe added successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Recipe already exists
 */

/**
 * @swagger
 * /plan:
 *   post:
 *     summary: Add a new meal plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *               plan:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of meals in the plan
 *     responses:
 *       200:
 *         description: Meal plan added successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Meal plan already exists
 */

const post_recipe = function (req, res) {
    // error handling
    if (!req.body) {
        return res.status(400).json("Error: Request body is empty");
    }
    // check, is there already this recipe in the db?
    recipe_model.findOne({ name: req.body.name }).then((data) => {
        if (data) return res.status(403).json("Recipe already present");
        else {
            const new_recipe = new recipe_model({
                name: req.body.name,
                type: req.body.type,
                calories: req.body.calories,
                ingredients: req.body.ingredients,
            });

            // save all recipes in the db
            new_recipe
                .save()
                .then((data) => {
                    res.json(data);
                })
                .catch((err) => {
                    return res.status(500).json("Saving error - " + err);
                });
        }
    });
};

const post_plan = function (req, res) {
    // error handling
    if (!req.body || !req.body.email || !req.body.plan) {
        return res.status(400).json("Error: Request body is empty or incomplete");
    }
    // check, is there already this recipe in the db?
    meal_plan_model.findOne({ user: email, menu: req.body.plan }).then((data) => {
        if (data) return res.status(403).json("Meal Plan already present");
        else {
            const new_plan = new meal_plan_model({
                menu: req.body.plan,
                // for which user?
                user: req.body.email,
            });

            // save new meal plan in the db
            new_plan
                .save()
                .then((data) => {
                    res.json(data);
                })
                .catch((err) => {
                    return res.status(500).json("Saving error" + err);
                });
        }
    });
};

module.exports = { post_recipe, post_plan };
