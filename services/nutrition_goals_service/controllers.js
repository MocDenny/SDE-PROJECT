const axios = require("axios");

const get_info = function (req, res) {
    // error handling
    if (!req.params.email || !req.params.calories) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }
    // who made the request?
    const email = req.params.email;
    const cal = req.params.calories;
    // divide by calories in order (breakfast, lunch & dinner)
    const cal_per_meal = [
        { min: 0.25 * cal, max: 0.3 * cal },
        { min: 0.35 * cal, max: 0.4 * cal },
    ];

    // get possible research parameters in the request
    let diet = req.params.diet;
    let intolerances = req.params.intolerances;
    // retrieve user info if necessary
    if (!diet || !intolerances) {
        // request info from adapter
        axios({
            method: "get",
            url: `http://${process.env.USER_DATA_CONTAINER}:${process.env.USER_DATA_PORT}/user/pref/${email}`,
            params: {
                email: email,
            },
        }).then(
            function (resp) {
                if (!diet) {
                    diet = resp.data.diet;
                }
                if (!intolerances) {
                    intolerances = resp.data.intolerances;
                }
                // return
                res.status(200).json({
                    cal_per_meal: cal_per_meal,
                    diet: diet,
                    intolerances: intolerances,
                });
            },
            // handle errors
            function (error) {
                if (error.response) {
                    // service responded with a status code
                    res.status(error.response.status).json(error.response.data);
                } else if (error.request) {
                    // no response received
                    res.status(500).json("Service non responsive");
                } else {
                    res.status(500).json("Error: " + error.message);
                }
            },
        );
    } else {
        res.status(200).json({
            cal_per_meal: cal_per_meal,
            diet: diet,
            intolerances: intolerances,
        });
    }
};

module.exports = { get_info };
