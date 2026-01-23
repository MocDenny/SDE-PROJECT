// users controllers
const {user_model} = require('./model/user.js')

const post_user = function (req, res) {
    // error handling
    if (!req.body){
        return res.status(400).json("Error: Request body is empty")
    } 
    // check, is there already this user in the db?
    user_model.findOne({ email: req.body.email })
    .then ( (data) => {
        if (data) return res.status(403).json("User already present");
        else {
            // if there are no preferences specified, insert default values
            let pref = req.body.preferences 
            if (!pref){
                pref = {
                    diet: 'none',
                    intolerances: []
                }
            }

            const new_user = new user_model({
                email: req.body.email,
                password: req.body.password,
                preferences: pref
            });
            
            new_user.save()
            .catch((err) => {
                return res.status(500).json("Saving error" + err );
            })
            .then((data) => {
                res.json(data);
            });
        }
    });
}

const get_user_pref = function (req, res) {
    // error handling
    if (!req.query.email){
        return res.status(400).json("Error: Request parameters are empty or incomplete")
    } 
    // find the correct user and return diet and intolerances
    user_model.findOne({ email: req.query.email })
    .then ( (data) => {
        if (!data) return res.status(403).json("User " + req.query.email + " is not present in the database");
        else {
            res.json(data.preferences)
        }
    });
}

module.exports = { post_user, get_user_pref }