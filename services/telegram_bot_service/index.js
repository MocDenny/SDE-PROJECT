const express = require("express");
//const cors = require("cors");
const axios = require("axios");

require("dotenv").config();

const app = express();
//app.use(cors());

// bot token is in .env file
const TelegramBot = require("node-telegram-bot-api");
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// /start command
bot.onText(/^\/start$/, (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    getUserDataByTelegramId(telegramUserId)
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
});

// /start <token> command
bot.onText(/^\/start (.+)$/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const telegramUserId = msg.from.id;
    const token = match[1];

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
            bot.sendMessage(telegramUserId, "Your Telegram account has been linked successfully!");
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
});

// /test command with inline keyboard
bot.onText(/\/test/, (msg) => {
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
});

bot.on("callback_query", (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;

    // Rispondi alla callback per rimuovere l'illuminazione del bottone
    bot.answerCallbackQuery(callbackQuery.id);

    let newText;
    if (data === "get_number") {
        bot.sendMessage(message.chat.id, "Ecco un numero: 42");
        newText = "Hai scelto: Ricevi un numero";
    } else if (data === "get_letter") {
        bot.sendMessage(message.chat.id, "Ecco una lettera: A");
        newText = "Hai scelto: Ricevi una lettera";
    }

    // Aggiorna il testo del messaggio e rimuovi i bottoni
    bot.editMessageText(newText, {
        chat_id: message.chat.id,
        message_id: message.message_id,
        reply_markup: { inline_keyboard: [] }, // Disattiva i bottoni aggiornando il messaggio con una tastiera vuota
    });
});

// function to get user data from user_data_service by telegramUserId
function getUserDataByTelegramId(telegramUserId) {
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
}

// unlink command
bot.onText(/^\/(unlink|stop)$/, (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    // before unlinking, check if the user is linked
    getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                unlinkTelegramUser(telegramUserId).then((successMessage) => {
                    bot.sendMessage(chatId, successMessage);
                });
            } else {
                bot.sendMessage(chatId, "This Telegram account is not linked to any user.");
            }
        })
        .catch((error) => {
            bot.sendMessage(chatId, "An error occurred while unlinking your account.");
        });
});

// monitor blocking/unblocking of the bot
bot.on("my_chat_member", (update) => {
    const chatId = update.chat.id;
    const telegramUserId = update.from.id;
    const newStatus = update.new_chat_member.status;

    if (newStatus === "kicked") {
        console.log(`User ${telegramUserId} blocked the bot.`);
        unlinkTelegramUser(telegramUserId)
            .then((successMessage) => {
                console.log(
                    `Account unlinking successful for user ${telegramUserId} after blocking the bot.`,
                );
            })
            .catch((error) => {
                console.log(
                    `Error while unlinking account for user ${telegramUserId} after blocking the bot: ${error.message}`,
                );
            });
    } else if (newStatus === "member") {
        console.log(`User ${telegramUserId} unblocked or restarted the bot.`);
    }
});

// utility function to unlink Telegram user
function unlinkTelegramUser(telegramUserId) {
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
}

app.listen(process.env.BOT_PORT, function () {
    console.log(`Service listening on port ${process.env.BOT_PORT}`);
});
