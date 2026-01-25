const axios = require("axios");

const get_menu = function (req, res) {
    // error handling
    if (
        !req.query.min_cal_breakfast ||
        !req.query.min_cal_other ||
        !req.query.max_cal_breakfast ||
        !req.query.max_cal_other ||
        !req.query.diet ||
        !req.query.intolerances
    ) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }

    const cal_breakfast = [req.query.min_cal_breakfast, req.query.max_cal_breakfast];
    const cal_other = [req.query.min_cal_other, req.query.max_cal_other];
    const diet = req.query.diet;
    const intolerances = req.query.intolerances;

    // records of the found recipes to fill
    let breakfast_list = [];
    let lunch_din_list = [];

    const handle_errors = function (error) {
        if (error.response) {
            // service responded with a status code
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // no response received
            res.status(500).json("Adapter Service non responsive");
        } else {
            res.status(500).json("Error: " + error.message);
        }
    };

    // 1. send requests for lunch & dinner
    axios({
        method: "get",
        url: "http://localhost:3005/recipes",
        params: {
            type: "main course",
            intolerances: intolerances,
            diet: diet,
            min_cal: cal_other[0],
            max_cal: cal_other[1],
            number: 28,
        },
    }).then(function (resp) {
        for (const result of resp.data) {
            lunch_din_list.push(result);
        }

        // fetch possible breakfasts

        axios({
            method: "get",
            url: "http://localhost:3005/recipes",
            params: {
                type: "breakfast",
                intolerances: intolerances,
                diet: diet,
                min_cal: cal_breakfast[0],
                max_cal: cal_breakfast[1],
                number: 14,
            },
        }).then(function (resp) {
            for (const result of resp.data) {
                breakfast_list.push(result);
            }
            // compose menu
            // beware of corner cases, i.e not enough recipes
            if (lunch_din_list.length == 0 || breakfast_list == 0) {
                res.status(500).json("Error: not enough recipes fitting the search parameters");
            } else {
                let plan_1 = [];
                let plan_2 = [];

                // sort main courses based on kcal -> ligther meals will be assigned to dinner
                const compare_cal = function (a, b) {
                    if (a.calories < b.calories) {
                        return -1;
                    } else if (a.calories > b.calories) {
                        return 1;
                    }
                    return 0;
                };
                lunch_din_list.sort(compare_cal);
                // if there are not enough recipes: repeat them
                const arr_length = lunch_din_list.length;
                for (let i = 0; i < 14; i++) {
                    let day = {
                        breakfast: breakfast_list[i % breakfast_list.length],
                        lunch: lunch_din_list[Math.abs((arr_length - 1 - i) % arr_length)],
                        dinner: lunch_din_list[i % arr_length],
                    };
                    if (i < 7) {
                        plan_1.push(day);
                    } else {
                        plan_2.push(day);
                    }
                }
                res.status(200).json({
                    plan_1: plan_1,
                    plan_2: plan_2,
                });
            }
        }, handle_errors);
    }, handle_errors);
};

module.exports = { get_menu };
