const axios = require("axios");
const { google } = require("googleapis");

// the scope for creating calendar events.
let oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    `http://localhost:${process.env.GROCERY_LIST_PORT}/callback`,
);

let event_info = {};

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
 *             type: object
 *             properties:
 *               list_content:
 *                 schema:
 *                   $ref: '#/components/schemas/GroceryList'
 *               auth_url:
 *                 type: string
 *                   description: Oauth link to give Google Calendar access to the project
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
            }).then((response) => {
                // update callpack
                const authUrl = oauth2Client.generateAuthUrl({
                    access_type: "offline",
                    scope: ["https://www.googleapis.com/auth/calendar"],
                    include_granted_scopes: true,
                });
                event_info = {
                    date_from: date_from,
                    date_to: date_to,
                    list: response.data,
                };
                res.status(200).json({ list_content: response.data, auth_url: authUrl });
            });
        })
        .catch((error) => {
            console.error("Error fetching grocery list:", error);
            res.status(500).json("Error fetching grocery list");
        });
};

/**
 * @swagger
 * /callback:
 *   get:
 *     tags:
 *      - Google Calendar Event Creation
 *     summary: Create an event for the generated shopping list.
 *     description: Creates a Google Calendar event to remind users to shop for their meal plan. It does not interface directly with the user.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The authentication code needed to access Google Calendar.
 *     responses:
 *       200:
 *         description: Event successfully created
 *         content:
 *           application/json:
 *             schema:
 *             type: string
 *             description: Successful creation message.
 *       400:
 *         description: Bad request, missing parameters
 *       500:
 *         description: Service error
 */
const oauth2callback = (req, res) => {
    // error handling
    if (!req.query) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }

    const { code } = req.query;
    // exchange for token

    if (code.error) {
        // An error response e.g. error=access_denied
        res.status(500).json("Oauth code error: " + code.error);
    } else {
        // transform shopping list to text
        const aisleEmojis = {
            "Nut butters, Jams, and Honey": "🍯",
            "Spices and Seasonings": "🌶️",
            Cereal: "🥣",
            Baking: "🧁",
            "Milk, Eggs, Other Dairy": "🥛",
            Meat: "🍖",
            "Alcoholic Beverages": "🍷",
            "Ethnic Foods": "🍜",
            Produce: "🥦",
            "Pasta and Rice": "🍝",
            "Bakery/Bread": "🍞",
            Condiments: "🫙",
            Seafood: "🦞",
            Beverages: "🧃",
            Cheese: "🧀",
            Nuts: "🥜",
            "Health Foods": "🥗",
            "Gluten Free": "🌾",
            Gourmet: "🍽️",
            "Sweet Snacks": "🍫",
            "Canned and Jarred": "🥫",
        };

        let output = "🛒 Grocery List\n\n";

        for (const [aisle, products] of Object.entries(event_info.list)) {
            const emoji = aisleEmojis[aisle] || "📂"; // Default emoji if aisle not found
            output += `${emoji} ${aisle}\n`;

            products.forEach((product) => {
                const name = product.name.charAt(0).toUpperCase() + product.name.slice(1);
                const roundedAmount = Math.ceil(product.amount * 100) / 100; // Round up to 2 decimal places
                const escapedAmount = roundedAmount.toString();
                const escapedUnit = product.unit;

                output += `\\- ${name}: ${escapedAmount} ${escapedUnit}\n`;
            });
            output += "\n"; // Add a blank line between aisles
        }

        oauth2Client.getToken(code).then((tokens) => {
            oauth2Client.setCredentials(tokens.tokens);
            const calendar = google.calendar({ version: "v3", auth: oauth2Client });
            // add event to calendar
            const event = {
                summary: "Grocery Shopping List",
                description: output,
                start: {
                    dateTime: event_info.date_from,
                    timeZone: "Europe/Rome",
                },
                end: {
                    dateTime: event_info.date_to,
                    timeZone: "Europe/Rome",
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: "email", minutes: 24 * 60 },
                        { method: "popup", minutes: 30 },
                    ],
                },
            };

            calendar.events.insert(
                {
                    auth: oauth2Client,
                    calendarId: "primary",
                    resource: event,
                },
                (err, event) => {
                    if (err) {
                        console.log("There was an error contacting the Calendar service: " + err);
                        res.status(500).json("Google Calendar Api error: " + err);
                    } else {
                        res.status(200).json("Event successfully created");
                    }
                },
            );
        });
    }
};

module.exports = {
    get_grocery_list,
    oauth2callback,
};
