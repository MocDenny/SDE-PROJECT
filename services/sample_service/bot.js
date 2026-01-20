// Bot token is in .env file

const TelegramBot = require('node-telegram-bot-api');
const token = import.meta.env.BOT_TOKEN; 
const bot = new TelegramBot(token, { polling: true });