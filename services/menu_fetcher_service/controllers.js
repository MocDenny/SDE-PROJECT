const axios = require("axios")

const get_menu = function (req, res) {
    // error handling
    if (!req.query.calories || !req.query.diet || !req.query.intolerances) {
        return res.status(400).json("Error: Request parameters are empty or incomplete")
    }

    const cal = req.query.calories
    const diet = req.query.diet
    const intolerances = req.query.intolerances
}

module.exports = { get_menu }