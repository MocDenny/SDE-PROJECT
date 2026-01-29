const axios = require("axios");

const get_meal_plan = function (req, res) {
    // error handling
    if (!req.params.email || !req.params.calories) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }
    // who made the request?
    const email = req.params.email;
    const calories = req.params.calories;

    // 1. call to get calories division and research filters
    const handle_errors = function (error) {
        if (error.response) {
            // service responded with a status code
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // no response received
            res.status(500).json("Service non responsive");
        } else {
            res.status(500).json("Error: " + error.message);
        }
    };

    axios({
        method: "get",
        url: `http://${process.env.NUTRITION_GOALS_CONTAINER}:${process.env.NUTRITION_GOALS_PORT}/goals/${email}/${calories}`,
    }).then(function (resp) {
        // 2. fetch 2 meal plans
        const cal_per_meal = resp.data.cal_per_meal;
        const diet = resp.data.diet;
        const intolerances = resp.data.intolerances;

        axios({
            method: "get",
            url: `http://${process.env.MENU_FETCHER_CONTAINER}:${process.env.MENU_FETCHER_PORT}/menu/${cal_per_meal[0].min}/${cal_per_meal[0].max}/${cal_per_meal[1].min}/${cal_per_meal[1].max}/${diet}/${intolerances}`,
        }).then(function (resp) {
            // 3. return 2 meal plans for the week
            res.status(200).json(resp.data);
        }, handle_errors);
    }, handle_errors);
};

const save_meal_plan = function (req, res) {
    // error handling
    if (!req.body.plan || !req.body.email) {
        return res.status(400).json("Error: Request Body is empty or incomplete");
    }

    const email = req.body.email;
    const plan = req.body.plan;
    let recipes_promises = [];
    const handle_errors = function (error) {
        if (error.response) {
            // service responded with a status code
            return { status: error.response.status, data: error.response.data };
        } else if (error.request) {
            // no response received
            return { status: 500, data: "Service non responsive" };
        } else {
            return { status: 500, data: error.message };
        }
    };

    // 1. check if all recipes are already saved in db
    for (const daily_menu of plan) {
        for (const key in daily_menu) {
            recipes_promises.push(
                axios({
                    method: "post",
                    url: `http://${process.env.RECIPE_DATA_CONTAINER}:${process.env.RECIPE_DATA_PORT}/recipe`,
                    data: {
                        name: daily_menu[key].name,
                        type: daily_menu[key].type,
                        calories: daily_menu[key].calories,
                        ingredients: daily_menu[key].ingredients,
                    },
                }).then(function (resp) {
                    return {
                        status: 200,
                        data: resp.data,
                    };
                }, handle_errors),
            );
        }
    }
    Promise.allSettled(recipes_promises).then(function (results) {
        // if even one returned a post ended badly return error to user
        let id_recipes = [];
        for (const promise_resp of results) {
            if (promise_resp.value.status != 200 && promise_resp.value.status != 403) {
                // error in insertion
                return res
                    .status(promise_resp.value.status)
                    .json("Save operation aborted because of invalid recipe data");
            } else {
                id_recipes.push(promise_resp.value.data._id);
            }
        }
        // 2. 'create' meal plan structure to send with recipes references
        let plan_with_ref = [];
        for (let i = 0; i < 7; i++) {
            const day = {
                breakfast: id_recipes[i * 3],
                lunch: id_recipes[1 + i * 3],
                dinner: id_recipes[2 + i * 3],
            };
            plan_with_ref.push(day);
        }

        // 3. get id of user
        const handle_errors_and_respond = function (error) {
            err_data = handle_errors(error);
            res.status(err_data.status).json(err_data.data);
        };
        axios({
            method: "get",
            url: `http://${process.env.USER_DATA_CONTAINER}:${process.env.USER_DATA_PORT}/user/${email}`,
        }).then(function (resp) {
            const account = resp.data;
            axios({
                method: "post",
                url: `http://${process.env.RECIPE_DATA_CONTAINER}:${process.env.RECIPE_DATA_PORT}/plan`,
                data: {
                    user: account._id,
                    plan: plan_with_ref,
                },
            }).then(function (resp) {
                console.log(resp.data);
                res.json(resp.data);
            }, handle_errors_and_respond);
        }, handle_errors_and_respond);
    });

    // contact user data service: retrieve user and save plan
    /*
    axios({
        method: "get",
        url: `http://${process.env.USER_DATA_CONTAINER}:${process.env.USER_DATA_PORT}/user/${email}`,
    }).then(function (resp) {
        const account = resp.data;
        axios({
            method: "post",
            url: "http://localhost:3004/menu",
            params: {
                cal_per_meal: cal_per_meal,
                diet: diet,
                intolerances: intolerances,
            },
        }).then(function (resp) {
            res.status(201).json(resp.data);
        }, handle_errors);
    }, handle_errors);
    */
};

module.exports = { get_meal_plan, save_meal_plan };
