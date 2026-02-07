const axios = require("axios");

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
