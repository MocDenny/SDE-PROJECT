const axios = require("axios");

// function to get user data from user_data_service by telegramUserId
const getUserDataByTelegramId = (telegramUserId) => {
    return axios
        .get(
            `http://${process.env.USER_DATA_CONTAINER}:${process.env.USER_DATA_PORT}/user?telegramId=${telegramUserId}`,
        )
        .then((response) => {
            if (response.data && response.data.email) {
                return response.data.email;
            } else {
                return null;
            }
        })
        .catch((error) => {
            // check the status code of the response
            if (error.response) {
                if (error.response.status === 403) {
                    return null; // user not found
                } else {
                    throw new Error(`Error: ${error.response.data}`);
                }
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        });
};

// utility function to unlink Telegram user
const unlinkTelegramUser = (telegramUserId) => {
    return axios
        .post(`http://${process.env.AUTH_CONTAINER}:${process.env.AUTH_PORT}/telegram_unlink`, {
            telegramUserId: telegramUserId,
        })
        .then(() => {
            return "Account successfully unlinked.";
        })
        .catch((error) => {
            if (error.response) {
                throw new Error(`Error: ${error.response.data}`);
            } else if (error.request) {
                throw new Error("The service did not respond. Please try again later.");
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        });
};

module.exports = {
    getUserDataByTelegramId,
    unlinkTelegramUser,
};
