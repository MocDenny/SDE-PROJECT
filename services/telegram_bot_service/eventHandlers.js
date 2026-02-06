const utils = require("./utils.js");

const onMyChatMember = (bot, update) => {
    const chatId = update.chat.id;
    const telegramUserId = update.from.id;
    const newStatus = update.new_chat_member.status;

    if (newStatus === "kicked") {
        console.log(`User ${telegramUserId} blocked the bot.`);
        utils
            .unlinkTelegramUser(telegramUserId)
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
};

module.exports = {
    onMyChatMember,
};
