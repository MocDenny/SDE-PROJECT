require("dotenv").config();

const {
    startCommand,
    startTokenCommand,
    testInlineKeyboard,
    unlinkCommand,
} = require("./commandHandlers.js");
const { onMyChatMember } = require("./eventHandlers.js");
const utils = require("./utils.js");

const TelegramBot = require("node-telegram-bot-api");
const token = process.env.BOT_TOKEN; // bot token is in .env file
const bot = new TelegramBot(token, { polling: true });

// ###################################### COMMANDS ######################################
// /start command
bot.onText(/^\/start$/, (msg) => startCommand(bot, msg));

// /start <token> command
bot.onText(/^\/start (.+)$/, (msg, match) => startTokenCommand(bot, msg, match));

// /test command with inline keyboard
bot.onText(/\/test/, (msg) => testInlineKeyboard(bot, msg));

// unlink command
bot.onText(/^\/(unlink|stop)$/, (msg) => unlinkCommand(bot, msg));

// ###################################### EVENTS ######################################
bot.on("polling_error", (error) => {
    console.error("Polling error:", error);
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

// monitor blocking/unblocking of the bot
bot.on("my_chat_member", (update) => onMyChatMember(bot, update));
