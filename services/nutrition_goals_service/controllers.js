const axios = require("axios");

const get_info = function (req, res) {
    console.log("Called /goals with URL: " + req.url);

    // error handling
    if (!req.query.email || !req.query.calories) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }

    console.log("Parameters received: " + req.query.email + ", " + req.query.calories);
    // who made the request?
    const email = req.query.email;
    const cal = req.query.calories;
    // divide by calories in order (breakfast, lunch & dinner)
    const cal_per_meal = [
        { min: 0.25 * cal, max: 0.3 * cal },
        { min: 0.35 * cal, max: 0.4 * cal },
    ];

    // get possible research parameters in the request
    let diet = req.query.diet;
    // intolerances can be:
    //  - not present in the request -> remains undefined
    //  - present but empty -> becomes an empty array
    //  - present and non-empty (comma separated strings) -> becomes an array of strings
    let intolerances =
        req.query.intolerances === ""
            ? []
            : req.query.intolerances
              ? req.query.intolerances.split(",").map((item) => item.trim())
              : undefined;
    console.log(
        "Optional parameters: diet: " + diet + ", intolerances: " + JSON.stringify(intolerances),
    );

    // retrieve user info if necessary
    if (!diet || !intolerances) {
        console.log("Retrieving user preferences (diet & intolerances)from user data service...");
        // request info from adapter
        axios({
            method: "get",
            url: `http://${process.env.USER_DATA_CONTAINER}:${process.env.USER_DATA_PORT}/user/${email}/preferences`,
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
                console.log(
                    "Retrieved user preferences: " + diet + ", " + JSON.stringify(intolerances),
                );
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
