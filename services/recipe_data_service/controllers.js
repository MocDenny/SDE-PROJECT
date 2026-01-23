// recipes controllers
const {recipe_model} = require('./model/recipe.js')

const post_recipe = function (req, res) {
    // error handling
    if (!req.body){
        return res.status(400).json("Error: Request body is empty")
    } 
    // check, is there already this recipe in the db?
    recipe_model.findOne({ name: req.body.name })
    .then ( (data) => {
        if (data) return res.status(403).json("Recipe already present");
        else {
            const new_recipe = new recipe_model({
                name: req.body.name,
                type: req.body.type,
                calories: req.body.calories,
                ingredients: req.body.ingredients
            });

            // save new recipe in the db
            new_recipe.save()
            .catch((err) => {
                return res.status(500).json("Saving error" + err);
            })
            .then((data) => {
                res.json(data);
            });
        }
    });
}

module.exports = { post_recipe }