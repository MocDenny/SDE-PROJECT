// recipes controllers
const { recipe_model } = require("./model/recipe.js");
const { meal_plan_model } = require("./model/meal_plan.js");

const post_recipe = function (req, res) {
    // error handling
    if (!req.body.name || !req.body.type || !req.body.calories || !req.body.ingredients) {
        return res.status(400).json({ error: "Error: Request body is empty" });
    }
    // check, is there already this recipe in the db?
    recipe_model.findOne({ name: req.body.name }).then((data) => {
        // need to send back id
        if (data) {
            return res
                .status(403)
                .json({ message: "Recipe already present", _id: data._id.toString() });
        } else {
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
                    res.json({ message: "Recipe successfully created", _id: data._id.toString() });
                })
                .catch((err) => {
                    res.status(400).json({ error: err });
                });
        }
    });
};

const post_plan = function (req, res) {
    // error handling
    if (!req.body.user || !req.body.plan) {
        return res.status(400).json({ error: "Error: Request body is empty or incomplete" });
    }
    // check, is there already this recipe in the db?
    meal_plan_model.findOne({ user: req.body.user, menu: req.body.plan }).then((data) => {
        if (data) return res.status(403).json({ message: "Plan already present", _id: data._id });
        else {
            const new_plan = new meal_plan_model({
                menu: req.body.plan,
                // for which user?
                user: req.body.user,
            });

            // save new meal plan in the db
            new_plan
                .save()
                .then((data) => {
                    res.json({ message: "Plan successfully created", _id: data._id });
                })
                .catch((err) => {
                    res.status(400).json({ error: err });
                });
        }
    });
};

module.exports = { post_recipe, post_plan };
