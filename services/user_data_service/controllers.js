const { v4: uuidv4 } = require("uuid");

// users controllers
const { user_model } = require("./model/user.js");

const post_user = function (req, res) {
    // error handling
    if (!req.body) {
        return res.status(400).json("Error: Request body is empty");
    }
    // check, is there already this user in the db?
    user_model.findOne({ email: req.body.email }).then((data) => {
        if (data) return res.status(403).json("User already present");
        else {
            // if there are no preferences specified, insert default values
            let pref = req.body.preferences;
            if (!pref) {
                pref = {
                    diet: "",
                    intolerances: [],
                };
            }

            // unique token generation for telegram linking
            const token = uuidv4();

            const new_user = new user_model({
                email: req.body.email,
                password: req.body.password,
                telegramLinkToken: token,
                preferences: pref,
            });

            new_user
                .save()
                .then((data) => {
                    res.json(data);
                })
                .catch((err) => {
                    return res.status(500).json("Saving error" + err);
                });
        }
    });
};

const get_user = function (req, res) {
    // error handling
    if (!req.params.email) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }
    // find the correct user and return diet and intolerances
    user_model.findOne({ email: req.params.email }).then((data) => {
        if (!data)
            return res
                .status(403)
                .json("User " + req.params.email + " is not present in the database");
        else {
            res.json(data);
        }
    });
};

// reduced info
const get_user_pref = function (req, res) {
    // error handling
    if (!req.query.email) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }
    // find the correct user and return diet and intolerances
    user_model.findOne({ email: req.query.email }).then((data) => {
        if (!data)
            return res
                .status(403)
                .json("User " + req.query.email + " is not present in the database");
        else {
            res.json(data.preferences);
        }
    });
};

const get_user_by_token = function (req, res) {
    // error handling
    if (!req.query.token) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }
    // find the correct user and return it
    user_model.findOne({ telegramLinkToken: req.query.token }).then((data) => {
        if (!data)
            return res
                .status(403)
                .json("Token " + req.query.token + " is not present in the database");
        else {
            res.json(data);
        }
    });
};

// patch user info
const patch_user = function (req, res) {
    // error handling
    if (!req.body || !req.params.email) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }
    // TODO validation of fields to update

    // find the correct user and update info
    user_model
        .findOneAndUpdate({ email: req.params.email }, { $set: req.body }, { new: true })
        .then((data) => {
            if (!data)
                return res
                    .status(403)
                    .json("User " + req.params.email + " is not present in the database");
            else {
                res.json(data);
            }
        });
};

module.exports = { post_user, get_user_pref, get_user, get_user_by_token, patch_user };
