// recipes controllers
const { recipe_model } = require("./model/recipe.js");
const { meal_plan_model } = require("./model/meal_plan.js");

/**
 * @swagger
 * tags:
 *   - name: Food Data Management
 *     description: Endpoints for saving and retrieving food related data to the application database.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Menu:
 *       type: array
 *       description: List of daily menus for the week
 *       items:
 *         type: object
 *         description: Object representing the meals for a single day
 *         properties:
 *           day:
 *             type: string
 *             format: date
 *             description: Date of the meal
 *           breakfast:
 *             type: object
 *             $ref: '#/components/schemas/Recipe'
 *           lunch:
 *             type: object
 *             $ref: '#/components/schemas/Recipe'
 *           dinner:
 *             type: object
 *             $ref: '#/components/schemas/Recipe'
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
 *     MealPlan:
 *       type: object
 *       description: Object representing a saved meal plan for a user
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the meal plan
 *         user:
 *           type: string
 *           description: Email of the user associated with the meal plan
 *         menu:
 *           $ref: '#/components/schemas/Menu'
 */

/**
 * @swagger
 * /recipe:
 *   post:
 *     tags:
 *       - Food Data Management
 *     summary: Saves a recipe to the database if it doesn't already exist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       201:
 *         description: Recipe added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Recipe already exists
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
                    res.status(201).json(data);
                })
                .catch((err) => {
                    return res.status(500).json("Saving error - " + err);
                });
        }
    });
};

/**
 * @swagger
 * /plan:
 *   post:
 *     tags:
 *       - Food Data Management
 *     summary: Save a new meal plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Object containing the user's email and the meal plan to save
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user associated with the meal plan
 *               plan:
 *                 $ref: '#/components/schemas/Menu'
 *     responses:
 *       201:
 *         description: Meal plan added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MealPlan'
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Meal plan overlaps with an existing plan in some of the days
 *       500:
 *         description: Internal server error
 */
const post_plan = async function (req, res) {
    console.log("Called POST /plan");
    try {
        // Validate request body
        const { email, plan } = req.body;
        if (!email || !plan || !Array.isArray(plan)) {
            return res.status(400).json("Error: Request body is empty or incomplete");
        }

        // Process each day in the meal plan
        const processedPlan = await Promise.all(
            plan.map(async (day) => {
                const { breakfast, lunch, dinner, day: date } = day;

                // Helper function to save or find a recipe
                const saveOrFindRecipe = async (recipe) => {
                    const existingRecipe = await recipe_model.findOne({ name: recipe.name });
                    if (existingRecipe) {
                        return existingRecipe._id;
                    } else {
                        const newRecipe = new recipe_model(recipe);
                        const savedRecipe = await newRecipe.save();
                        return savedRecipe._id;
                    }
                };

                // Save or find recipes for breakfast, lunch, and dinner
                const breakfastId = await saveOrFindRecipe(breakfast);
                const lunchId = await saveOrFindRecipe(lunch);
                const dinnerId = await saveOrFindRecipe(dinner);

                return {
                    day: date,
                    breakfast: breakfastId,
                    lunch: lunchId,
                    dinner: dinnerId,
                };
            }),
        );

        // Check for overlapping meal plans
        const overlappingPlans = await meal_plan_model.find({
            user: email,
            "menu.day": { $in: processedPlan.map((day) => day.day) },
        });

        if (overlappingPlans.length > 0) {
            return res.status(403).json("Meal Plan overlaps with an existing plan");
        }

        // Create and save the new meal plan
        const new_plan = new meal_plan_model({
            menu: processedPlan,
            user: email,
        });

        const savedPlan = await new_plan.save();
        return res.status(201).json(savedPlan);
    } catch (err) {
        console.error("Error saving meal plan:", err);
        return res.status(500).json("Internal Server Error");
    }
};

const get_plan = function (req, res) {
    console.log("Called GET /plan");
    // error handling
    if (!req.query.email) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }

    // optional parameters: date_from, date_to
    const date_from = req.query.date_from; // get all plans with days from this date
    const date_to = req.query.date_to; // get all plans with days up to this date

    const email = req.query.email;

    // find meal plans for the user
    meal_plan_model
        .find({ user: email })
        .then(async (plans) => {
            // filter plans by date range if provided
            let filteredPlans = plans;
            if (date_from) {
                filteredPlans = filteredPlans.filter((plan) =>
                    plan.menu.some((day) => new Date(day.day) >= new Date(date_from)),
                );
            }
            if (date_to) {
                filteredPlans = filteredPlans.filter((plan) =>
                    plan.menu.some((day) => new Date(day.day) <= new Date(date_to)),
                );
            }

            // populate recipe details
            const populatedPlans = await Promise.all(
                filteredPlans.map(async (plan) => {
                    const populatedMenu = await Promise.all(
                        plan.menu.map(async (day) => {
                            const breakfast = await recipe_model.findById(day.breakfast);
                            const lunch = await recipe_model.findById(day.lunch);
                            const dinner = await recipe_model.findById(day.dinner);
                            return {
                                day: day.day,
                                breakfast,
                                lunch,
                                dinner,
                            };
                        }),
                    );
                    return {
                        _id: plan._id,
                        user: plan.user,
                        menu: populatedMenu,
                    };
                }),
            );

            res.status(200).json(populatedPlans);
        })
        .catch((err) => {
            console.error("Error retrieving meal plans:", err);
            return res.status(500).json("Internal Server Error");
        });
};

module.exports = { post_recipe, post_plan, get_plan };
