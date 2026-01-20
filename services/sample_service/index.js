const express = require('express');
const cors = require('cors');
require('dotenv').config()

console.log("Application started");

const app = express();
app.use(cors());

// bot token is in .env file
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN; 
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  
  bot.sendMessage(chatId, 'Bot Test successful');
});

// when communication between vuejs and telegram/server is needed
app.listen(3001, function () {
    console.log("Server listening on port 3001");
});