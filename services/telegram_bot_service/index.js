require("dotenv").config();

const {
    startCommand,
    startTokenCommand,
    testInlineKeyboard,
    newPlanCommand,
    unlinkCommand,
} = require("./commandHandlers.js");
const { onMyChatMember } = require("./eventHandlers.js");
const utils = require("./utils.js");

const TelegramBot = require("node-telegram-bot-api");
const token = process.env.BOT_TOKEN; // bot token is in .env file
const bot = new TelegramBot(token, { polling: true, parse_mode: "MarkdownV2" });

// ###################################### COMMANDS ######################################
// /start command
bot.onText(/^\/start$/, (msg) => startCommand(bot, msg));

// /start <token> command
bot.onText(/^\/start (.+)$/, (msg, match) => startTokenCommand(bot, msg, match));

// /newplan command
bot.onText(/^\/newplan$/, (msg) => newPlanCommand(bot, msg));


// /newPlan command
bot.onText(/^\/newPlan$/, (msg) => newPlanCommand(bot, msg));

// unlink command
bot.onText(/^\/(unlink|stop)$/, (msg) => unlinkCommand(bot, msg));

// ###################################### EVENTS ######################################
bot.on("polling_error", (error) => {
    console.error("Polling error:", error);
});

// monitor blocking/unblocking of the bot
bot.on("my_chat_member", (update) => onMyChatMember(bot, update));
