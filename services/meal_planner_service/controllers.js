const axios = require("axios");
const qs = require("qs");

// Configura un'istanza personalizzata di Axios
const axiosInstance = axios.create({
    paramsSerializer: (params) => {
        return qs.stringify(params, {
            encode: false, // Non codificare i caratteri speciali
            arrayFormat: "comma", // Serializza gli array come stringhe separate da virgola
        });
    },
});

/**
 * @swagger
 * tags:
 *   - name: Meal Plan Generation
 *     description: Endpoints for generating meal plans
 *   - name: Meal Plan Management
 *     description: Endpoints for saving and retrieving meal plans
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MealPlanOptions:
 *       type: object
 *       description: Object containing two meal plan options for the week
 *       properties:
 *         plan_1:
 *           type: object
 *           $ref: '#/components/schemas/Menu'
 *         plan_2:
 *           type: object
 *           $ref: '#/components/schemas/Menu'
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
 *     MealPlanList:
 *       type: array
 *       description: List of meal plans associated with a user
 *       items:
 *         $ref: '#/components/schemas/MealPlan'
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
 * /plan/new:
 *   get:
 *     tags:
 *       - Meal Plan Generation
 *     summary: Generate two meal plan options for the week
 *     description: Generates two meal plan options for the week based on user preferences and caloric intake.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *       - in: query
 *         name: calories
 *         required: true
 *         schema:
 *           type: integer
 *         description: Total daily caloric intake
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the meal plan
 *       - in: query
 *         name: diet
 *         required: false
 *         schema:
 *           type: string
 *         description: User diet preference
 *       - in: query
 *         name: intolerances
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: User intolerances (comma-separated)
 *     responses:
 *       200:
 *         description: Meal plans generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MealPlanOptions'
 *       400:
 *         description: Bad request, missing parameters
 *       500:
 *         description: Service error
 */
const get_meal_plan = function (req, res) {
    console.log("Called GET /plan/new");

    // error handling
    if (!req.query.email || !req.query.calories || !req.query.start_date) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }

    console.log(
        "Parameters received: " +
            req.query.email +
            ", " +
            req.query.calories +
            ", " +
            req.query.start_date,
    );

    // who made the request?
    const email = req.query.email;
    const calories = req.query.calories;
    const start_date = req.query.start_date;

    // get possible research parameters in the request
    let diet = req.query.diet;
    // intolerances can be:
    //  - not present in the request -> remains undefined
    //  - present but empty -> remains an empty string
    //  - present and non-empty (comma separated strings) -> becomes an array of strings
    let intolerances =
        req.query.intolerances === ""
            ? ""
            : req.query.intolerances
              ? req.query.intolerances.split(",").map((item) => item.trim())
              : undefined;
    console.log(
        "Optional parameters: diet: " + diet + ", intolerances: " + JSON.stringify(intolerances),
    );

    axiosInstance({
        method: "get",
        url: `http://${process.env.NUTRITION_GOALS_CONTAINER}:${process.env.NUTRITION_GOALS_PORT}/goals`,
        params: {
            email: email,
            calories: calories,
            diet: diet,
            intolerances: intolerances,
        },
    }).then(
        function (resp) {
            // 2. fetch 2 meal plans
            const cal_per_meal = resp.data.cal_per_meal;
            const diet = resp.data.diet;
            let intolerances = resp.data.intolerances;

            console.log(
                "Retrieved nutrition goals: " +
                    JSON.stringify(cal_per_meal) +
                    ", " +
                    diet +
                    ", " +
                    JSON.stringify(intolerances),
            );

            // if intolerances is an empty array, convert to empty string for the next request
            if (Array.isArray(intolerances) && intolerances.length === 0) {
                intolerances = "";
            }

            axiosInstance({
                method: "get",
                url: `http://${process.env.MENU_FETCHER_CONTAINER}:${process.env.MENU_FETCHER_PORT}/menu`,
                params: {
                    bf_min_cal: cal_per_meal[0].min,
                    bf_max_cal: cal_per_meal[0].max,
                    ld_min_cal: cal_per_meal[1].min,
                    ld_max_cal: cal_per_meal[1].max,
                    diet: diet,
                    intolerances: intolerances,
                    start_date: start_date,
                },
            }).then(
                function (resp) {
                    // 3. return 2 meal plans for the week
                    res.status(200).json(resp.data);
                },
                (error) => handle_errors(error, res),
            );
        },
        (error) => handle_errors(error, res),
    );
};

/**
 * @swagger
 * /plan:
 *   post:
 *     tags:
 *       - Meal Plan Management
 *     summary: Save a meal plan
 *     description: Saves a meal plan to the database for a user.
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
 *                 type: object
 *                 description: The selected meal plan to save, containing the meals for the week
 *                 $ref: '#/components/schemas/Menu'
 *     responses:
 *       201:
 *         description: Meal plan saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MealPlan'
 *       400:
 *         description: Bad request, missing parameters
 *       500:
 *         description: Service error
 */
const save_meal_plan = function (req, res) {
    console.log("Called POST /plan");
    // error handling
    if (!req.body.plan || !req.body.email) {
        return res.status(400).json("Error: Request Body is empty or incomplete");
    }
    // who made the request?
    const email = req.body.email;
    const plan = req.body.plan;

    axios({
        method: "post",
        url: `http://${process.env.RECIPE_DATA_CONTAINER}:${process.env.RECIPE_DATA_PORT}/plan`,
        data: {
            plan: plan,
            email: email,
        },
    }).then(
        function (resp) {
            res.status(201).json(resp.data);
            console.log("Meal plan saved successfully for user: " + email);
        },
        (error) => handle_errors(error, res),
    );
};

/**
 * @swagger
 * /plan:
 *   get:
 *     tags:
 *       - Meal Plan Management
 *     summary: Retrieve saved meal plans
 *     description: Retrieves saved meal plans for a user within a specified date range.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *       - in: query
 *         name: date_from
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering meal plans
 *       - in: query
 *         name: date_to
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering meal plans
 *     responses:
 *       200:
 *         description: Meal plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MealPlanList'
 *       400:
 *         description: Bad request, missing parameters
 *       500:
 *         description: Service error
 */
const get_user_plans = function (req, res) {
    console.log("Called GET /plan");
    // error handling
    if (!req.query.email) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }

    console.log(
        "Parameters received: " +
            req.query.email +
            ", " +
            req.query.date_from +
            ", " +
            req.query.date_to,
    );

    // optional parameters: date_from, date_to
    const date_from = req.query.date_from; // get all plans from this date
    const date_to = req.query.date_to; // get all plans up to this date

    // who made the request?
    const email = req.query.email;

    axios({
        method: "get",
        url: `http://${process.env.RECIPE_DATA_CONTAINER}:${process.env.RECIPE_DATA_PORT}/plan`,
        params: {
            email: email,
            date_from: date_from,
            date_to: date_to,
        },
    }).then(
        function (resp) {
            res.status(200).json(resp.data);
            console.log("Retrieved saved meal plans for user: " + email);
        },
        (error) => handle_errors(error, res),
    );
};

// 1. call to get calories division and research filters
const handle_errors = function (error, res) {
    if (error.response) {
        // service responded with a status code
        res.status(error.response.status).json(error.response.data);
        console.log("Error: " + JSON.stringify(error));
    } else if (error.request) {
        // no response received
        res.status(500).json("Service non responsive");
        console.log("Service non responsive. Error: ", JSON.stringify(error));
    } else {
        res.status(500).json("Error: " + error.message);
        console.log("Error: " + JSON.stringify(error));
    }
};

module.exports = { get_meal_plan, save_meal_plan, get_user_plans };
