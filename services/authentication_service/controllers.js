const axios = require("axios");

const login = function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    console.log("Login attempt for user: " + email + " with password: " + password);

    // retrieve user info based on the email
    axios({
        method: "get",
        url: `http://user_data_service:3002/user/${email}`,
    }).then(
        function (resp) {
            const user = resp.data;
            // check password
            if (user.password === password) {
                console.log("Login successful for user: " + email);
                res.status(200).json(resp.data);
            } else {
                console.log("Invalid password for user: " + email);
                res.status(401).json("Invalid password");
            }
        },
        function (error) {
            console.error("Error retrieving user info:", error);
            if (error.response) {
                // service responded with a status code
                res.status(error.response.status).json(error.response.data);
            } else if (error.request) {
                // no response received
                console.error("No response received:", error.request);
                res.status(500).json("Service non responsive");
            } else {
                console.error("Error message:", error.message);
                res.status(500).json("Error: " + error.message);
            }
        },
    );
};

const signup = function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const diet = req.body.diet || "";
    const intolerances = req.body.intolerances || [];
    const pref = { diet: diet, intolerances: intolerances };

    axios({
        method: "post",
        url: "http://user_data_service:3002/user",
        data: {
            email: email,
            password: password,
            preferences: pref,
        },
    }).then(
        function (resp) {
            console.log("Signup successful for user: " + email);
            res.status(201).json(resp.data);
        },
        function (error) {
            console.error("Error during signup:", error);
            if (error.response) {
                // service responded with a status code
                res.status(error.response.status).json(error.response.data);
            } else if (error.request) {
                // no response received
                console.error("No response received:", error.request);
                res.status(500).json("Service non responsive");
            } else {
                console.error("Error message:", error.message);
                res.status(500).json("Error: " + error.message);
            }
        },
    );
};

const telegram_link_account = function (req, res) {
    // get the telegram user id and token from the request
    const telegramUserId = req.body.telegramUserId;
    const token = req.body.token;

    console.log("Linking Telegram user ID " + telegramUserId + " with token " + token);

    // retrieve user info based on the token
    axios({
        method: "get",
        url: "http://user_data_service:3002/userByToken",
        params: {
            token: token,
        },
    }).then(
        function (resp) {
            console.log("User info retrieved successfully:", resp.data);
            const email = resp.data.email;
            // link the telegramUserId with the user account in the database
            axios({
                method: "patch",
                url: `http://user_data_service:3002/user/${email}`,
                data: {
                    telegramUserId: telegramUserId,
                },
            }).then(
                function (resp) {
                    console.log("Telegram account linked successfully:", resp.data);
                    res.status(200).json("Telegram account linked successfully");
                },
                // handle errors on linking
                function (error) {
                    console.error("Error linking Telegram account:", error);
                    if (error.response) {
                        // service responded with a status code
                        res.status(error.response.status).json(error.response.data);
                    } else if (error.request) {
                        // no response received
                        console.error("No response received:", error.request);
                        res.status(500).json("Service non responsive");
                    } else {
                        console.error("Error message:", error.message);
                        res.status(500).json("Error: " + error.message);
                    }
                },
            );
        },
        // handle errors on retrieving user info
        function (error) {
            console.error("Error retrieving user info:", error);
            if (error.response) {
                // service responded with a status code
                res.status(error.response.status).json(error.response.data);
            } else if (error.request) {
                // no response received
                console.error("No response received:", error.request);
                res.status(500).json("Service non responsive");
            } else {
                console.error("Error message:", error.message);
                res.status(500).json("Error: " + error.message);
            }
        },
    );
};

module.exports = {
    login,
    signup,
    telegram_link_account,
};
