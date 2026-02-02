const axios = require("axios");
const utils = require("./utils.js");

const { getUserDataByTelegramId } = require("./utils.js");

const startCommand = (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    utils
        .getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                bot.sendMessage(
                    chatId,
                    `Hi! This Telegram account is already linked to user '${email}'. To learn more about using the Meal Planner bot, use the /help command. To unlink your account use the /unlink command.`,
                );
            } else {
                bot.sendMessage(
                    chatId,
                    "Welcome to the Meal Planner bot! To link your account, please log in or sign up on our website and visit the profile page. Then, click on 'Telegram Connection' and follow the instructions.",
                );
            }
        })
        .catch((error) => {
            bot.sendMessage(chatId, "I'm sorry, an error occurred while retrieving your data.");
            console.log("[/start] Error while connecting to backend:" + error.message);
        });
};

const startTokenCommand = (bot, msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const telegramUserId = msg.from.id;
    const chatId = msg.chat.id;
    const token = match[1];

    utils
        .getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                bot.sendMessage(
                    chatId,
                    `Hi! This Telegram account is already linked to user '${email}'. To learn more about using the Meal Planner bot, use the /help command. To unlink your account use the /unlink command.`,
                );
            } else {
                // link the chatId with a user account in the database with authentication_service
                axios({
                    method: "post",
                    url: `http://${process.env.AUTH_CONTAINER}:${process.env.AUTH_PORT}/telegram_link`,
                    data: {
                        telegramUserId: telegramUserId,
                        token: token,
                    },
                }).then(
                    // elaborate response based on resp code and data
                    function (resp) {
                        // send back success message
                        bot.sendMessage(
                            telegramUserId,
                            "Your Telegram account has been linked successfully!",
                        );
                    },
                    function (error) {
                        // send back error message
                        if (error.response) {
                            // service responded with a status code
                            bot.sendMessage(telegramUserId, "Error: " + error.response.data);
                        } else if (error.request) {
                            // no response received
                            bot.sendMessage(telegramUserId, "Service non responsive");
                        } else {
                            bot.sendMessage(telegramUserId, "Error: " + error.message);
                        }
                    },
                );
            }
        })
        .catch((error) => {
            bot.sendMessage(chatId, "I'm sorry, an error occurred while retrieving your data.");
            console.log("[/start] Error while connecting to backend:" + error.message);
        });
};

const testInlineKeyboard = (bot, msg) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Ricevi un numero", callback_data: "get_number" },
                    { text: "Ricevi una lettera", callback_data: "get_letter" },
                ],
            ],
        },
    };

    bot.sendMessage(chatId, "Scegli un'opzione:", options);
};

const unlinkCommand = (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    // before unlinking, check if the user is linked
    utils
        .getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                utils.unlinkTelegramUser(telegramUserId).then((successMessage) => {
                    bot.sendMessage(chatId, successMessage);
                });
            } else {
                bot.sendMessage(chatId, "This Telegram account is not linked to any user.");
            }
        })
        .catch((error) => {
            bot.sendMessage(chatId, "An error occurred while unlinking your account.");
        });
};

module.exports = {
    startCommand,
    startTokenCommand,
    testInlineKeyboard,
    unlinkCommand,
};
