const get_meal_plan = function (req, res) {
    // error handling
    if (!req.query.email || !req.query.calories) {
        return res.status(400).json("Error: Request parameters are empty or incomplete")
    }
    // who made the request?
    const email = req.query.email
    const calories = req.query.calories
    // TODO: check login process -> is there a token, or other checks to ensure email param is valid?
    // get possible research parameters in the request
    const diet = req.query.diet
    const intolerances = req.query.intolerances
    // 1. call to get calories division and research filters
    axios({
        method: 'get',
        url: 'http://localhost:3003/goals',
        params: {
            email: email,
            calories: calories
        }
    })
        .then(
            function (resp) {
                // 2. call to fetch daily recipes from Spoonacular
                
                // 3. return 2 meal plans for the week

            },
            // handle errors
            function (error) {
                if (error.response) {
                    // service responded with a status code
                    res.status(error.response.status).json(error.response.data)
                } else if (error.request) {
                    // no response received
                    res.status(500).json("Service non responsive")
                } else {
                    res.status(500).json("Error: " + error.message)
                }
            }
        )
}

module.exports = { get_meal_plan }