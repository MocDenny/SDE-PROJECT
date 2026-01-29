const axios = require("axios");

const login = function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    // retrieve user info based on the email
    axios({
        method: "get",
        url: `http://${process.env.USER_DATA_CONTAINER}:${process.env.USER_DATA_PORT}/user/${email}`,
    }).then(
        function (resp) {
            const user = resp.data;
            // check password
            if (user.password === password) {
                console.log("Login successful for user: " + email);
                res.status(200).json("Login successful!");
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
    const pref = req.body.preferences || {};

    axios({
        method: "post",
        url: `http://${process.env.USER_DATA_CONTAINER}:${process.env.USER_DATA_PORT}/user`,
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
        url: `http://${process.env.USER_DATA_CONTAINER}:${process.env.USER_DATA_PORT}/userByToken/${token}`,
    }).then(
        function (resp) {
            console.log("User info retrieved successfully:", resp.data);
            const email = resp.data.email;
            // link the telegramUserId with the user account in the database
            axios({
                method: "patch",
                url: `http://${process.env.USER_DATA_CONTAINER}:${process.env.USER_DATA_PORT}/user/${email}`,
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
