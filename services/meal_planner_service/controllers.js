const get_meal_plan = function (req, res) {
    // error handling
    if (!req.query.user_id || !req.query.calories) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }
    // who made the request?
    const user_id = req.query.user_id;
    const calories = req.query.calories;
    // TODO: check login process -> is there a token, or other checks to ensure user_id param is valid?

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
        url: "http://localhost:3003/goals",
        params: {
            user_id: user_id,
            calories: calories,
        },
    }).then(function (resp) {
        // 2. fetch 2 meal plans
        const cal_per_meal = resp.data.cal_per_meal;
        const diet = resp.data.diet;
        const intolerances = resp.data.intolerances;

        axios({
            method: "get",
            url: "http://localhost:3004/menu",
            params: {
                min_cal_breakfast: cal_per_meal[0].min,
                max_cal_breakfast: cal_per_meal[0].max,
                min_cal_other: cal_per_meal[1].min,
                max_cal_other: cal_per_meal[1].max,
                diet: diet,
                intolerances: intolerances,
            },
        }).then(function (resp) {
            // 3. return 2 meal plans for the week
            res.status(200).json(resp.data);
        }, handle_errors);
    }, handle_errors);
};

const save_meal_plan = function (req, res) {
    // error handling
    if (!req.body.plan || !req.body.user_id) {
        return res.status(400).json("Error: Request Body is empty or incomplete");
    }
    // who made the request?
    const user_id = req.body.user_id;
    const plan = req.body.plan;
    // TODO: check login process -> is there a token, or other checks to ensure user_id param is valuser_id?

    // contact user data service: retrieve user and save plan
    axios({
        method: "get",
        url: "http://localhost:3002/user",
        params: {
            user_id: user_id,
        },
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
};

module.exports = { get_meal_plan, save_meal_plan };
