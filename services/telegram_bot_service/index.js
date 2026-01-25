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

bot.onText(/\/start (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const telegramUserId = msg.from.id;
    const token = match[1];

    // link the chatId with a user account in the database with authentication_service
    axios({
        method: "post",
        url: "http://authentication_service:3006/telegram_link",
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

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    bot.sendMessage(chatId, "Bot Test successful");
});

app.listen(3020, function () {
    console.log("Server listening on port 3020");
});
