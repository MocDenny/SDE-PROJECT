require("dotenv").config();

const {
    startCommand,
    startTokenCommand,
    newPlanCommand,
    myPlansCommand,
    groceryListCommand,
    unlinkCommand,
    helpCommand,
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

// /help command
bot.onText(/^\/help$/, (msg) => helpCommand(bot, msg));

// /newplan command
bot.onText(/^\/newplan$/, (msg) => newPlanCommand(bot, msg));

// /myplans command
bot.onText(/^\/myplans$/, (msg) => myPlansCommand(bot, msg));

// /grocerylist command
bot.onText(/^\/grocerylist$/, (msg) => groceryListCommand(bot, msg));

// unlink command
bot.onText(/^\/(unlink|stop)$/, (msg) => unlinkCommand(bot, msg));

// ###################################### EVENTS ######################################
bot.on("polling_error", (error) => {
    console.error("Polling error:", error);
});

// monitor blocking/unblocking of the bot
bot.on("my_chat_member", (update) => onMyChatMember(bot, update));

// Define bot commands for the dropdown menu
bot.setMyCommands([
    { command: "start", description: "Get started with the bot" },
    { command: "help", description: "Get help and instructions" },
    { command: "newplan", description: "Create a new plan" },
    { command: "myplans", description: "View your plans" },
    { command: "grocerylist", description: "Get your grocery list" },
    { command: "unlink", description: "Unlink your account" },
]);
