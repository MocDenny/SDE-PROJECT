const axios = require("axios");

/**
 * @swagger
 * tags:
 *   - name: Grocery List Management
 *     description: Endpoints for managing grocery lists.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GroceryList:
 *       type: object
 *       description: Object representing an optimized grocery list
 *       properties:
 *         aisle1Name:
 *           type: array
 *           description: Array of the products in the aisle
 *           items:
 *             type: object
 *             description: Ingredient object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the ingredient
 *               amount:
 *                 type: number
 *                 description: Total amount of the ingredient needed across all recipes
 *               unit:
 *                 type: string
 *                 description: Unit of measurement for the ingredient amount
 *               aisle:
 *                 type: string
 *                 description: Aisle where the ingredient can be found in the store
 *         aisle2Name:
 *           type: array
 *           description: Array of the products in the aisle
 *           items:
 *             type: object
 *             description: Ingredient object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the ingredient
 *               amount:
 *                 type: number
 *                 description: Total amount of the ingredient needed across all recipes
 *               unit:
 *                 type: string
 *                 description: Unit of measurement for the ingredient amount
 *               aisle:
 *                 type: string
 *                 description: Aisle where the ingredient can be found in the store
 */

/**
 * @swagger
 * /groceryList:
 *   get:
 *     tags:
 *      - Grocery List Management
 *     summary: Generate a new grocery list for a date range
 *     description: Returns a grocery list based on saved meal plans within a specified date range.
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
 *         description: Grocery list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroceryList'
 *       400:
 *         description: Bad request, missing parameters
 *       500:
 *         description: Service error
 */
const get_grocery_list = function (req, res) {
    console.log("Called GET /groceryList");

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

    // who made the request?
    const email = req.query.email;
    // optional parameters: date_from, date_to
    const date_from = new Date(req.query.date_from); // get all recipe ingredients from this date
    const date_to = new Date(req.query.date_to); // get all recipe ingredients up to this date

    axios({
        method: "get",
        url: `http://${process.env.RECIPE_DATA_CONTAINER}:${process.env.RECIPE_DATA_PORT}/plan`,
        params: {
            email: email,
            date_from: date_from,
            date_to: date_to,
        },
    })
        .then((response) => {
            // save in an array all the recipes that are inside the date range (if present)
            const plans = response.data;
            const recipes = [];
            for (const plan of plans) {
                for (const day of plan.menu) {
                    if (date_from && new Date(day.day) < date_from) {
                        continue; // skip days before date_from
                    }
                    if (date_to && new Date(day.day) > date_to) {
                        continue; // skip days after date_to
                    }
                    recipes.push(day.breakfast);
                    recipes.push(day.lunch);
                    recipes.push(day.dinner);
                }
            }

            // call grocery opt. service and pass the recipes to get the grocery list
            axios({
                method: "post",
                url: `http://${process.env.GROCERY_OPT_CONTAINER}:${process.env.GROCERY_OPT_PORT}/optimizeList`,
                data: {
                    recipes: recipes,
                },
            })
                .then((response) => {
                    res.status(200).json(response.data);
                })
                .catch((error) => {
                    console.error("Error optimizing grocery list:", error);
                    res.status(500).json("Error optimizing grocery list");
                });
        })
        .catch((error) => {
            console.error("Error fetching grocery list:", error);
            res.status(500).json("Error fetching grocery list");
        });
};

module.exports = {
    get_grocery_list,
};
