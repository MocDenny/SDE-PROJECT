const axios = require("axios");

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
    telegram_link_account,
};
