const { v4: uuidv4 } = require("uuid");

// users controllers
const { user_model } = require("./model/user.js");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *         telegramLinkToken:
 *           type: string
 *           description: Unique token for linking with Telegram
 *         preferences:
 *           type: object
 *           properties:
 *             diet:
 *               type: string
 *               description: Preferred diet
 *             intolerances:
 *               type: array
 *               items:
 *                 type: string
 *                 description: List of intolerances
 */

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Creates a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: User already present
 */
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

/**
 * @swagger
 * /user/{email}:
 *   get:
 *     summary: Fetch details of a user
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *     responses:
 *       200:
 *         description: User details
 *       400:
 *         description: Missing parameters
 *       403:
 *         description: User not found
 */
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

/**
 * @swagger
 * /user/pref/{email}:
 *   get:
 *     summary: Fetch user preferences
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *     responses:
 *       200:
 *         description: User preferences
 *       400:
 *         description: Missing parameters
 *       403:
 *         description: User not found
 */
const get_user_pref = function (req, res) {
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
            res.json(data.preferences);
        }
    });
};

/**
 * @swagger
 * /userByToken/{token}:
 *   get:
 *     summary: Fetch user details by Telegram token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Telegram link token
 *     responses:
 *       200:
 *         description: User details
 *       400:
 *         description: Missing parameters
 *       403:
 *         description: Token not found
 */
const get_user_by_token = function (req, res) {
    // error handling
    if (!req.params.token) {
        return res.status(400).json("Error: Request parameters are empty or incomplete");
    }
    // find the correct user and return it
    user_model.findOne({ telegramLinkToken: req.params.token }).then((data) => {
        if (!data)
            return res
                .status(403)
                .json("Token " + req.params.token + " is not present in the database");
        else {
            res.json(data);
        }
    });
};

/**
 * @swagger
 * /user/{email}:
 *   patch:
 *     summary: Updates user information
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: User not found
 */
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
