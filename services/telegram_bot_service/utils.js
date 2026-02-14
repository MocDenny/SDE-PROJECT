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

const printMealPlan = (plan, extended) => {
    console.log("Printing meal plan");
    let output = "📅 *Weekly meal plan*\n\n";

    plan.forEach((dayPlan) => {
        const date = new Date(dayPlan.day).toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        output += `🗓️ *${escapeMarkdownV2(date)}*\n`;
        output += `🍳 *Breakfast*: ${escapeMarkdownV2(dayPlan.breakfast.name)} \\(${escapeMarkdownV2(dayPlan.breakfast.calories.toString())} kcal\\)\n`;
        output += `🍴 *Lunch*: ${escapeMarkdownV2(dayPlan.lunch.name)} \\(${escapeMarkdownV2(dayPlan.lunch.calories.toString())} kcal\\)\n`;
        output += `🍽️ *Dinner*: ${escapeMarkdownV2(dayPlan.dinner.name)} \\(${escapeMarkdownV2(dayPlan.dinner.calories.toString())} kcal\\)\n\n`;
    });

    return output;
};

// function to escape MarkdownV2 reserved characters
const escapeMarkdownV2 = (text) => {
    return text.replace(/[\\_*\[\]()~`>#+\-=|{}.!]/g, "\\$&");
};

const askForValidDate = (bot, chatId, message, inlineKeyboard = [], validate = null) => {
    const isValidDate = (dateString) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) {
            return false;
        }
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    };

    return new Promise((resolve) => {
        const ask = () => {
            const options =
                inlineKeyboard.length > 0
                    ? {
                          reply_markup: {
                              inline_keyboard: inlineKeyboard,
                          },
                      }
                    : {};

            const messageListener = (msg) => {
                if (msg.chat.id === chatId) {
                    if (isValidDate(msg.text)) {
                        if (!validate || validate(msg.text)) {
                            cleanupListeners();
                            resolve(msg.text);
                        } else {
                            cleanupListeners();
                            bot.sendMessage(
                                chatId,
                                "The date entered is not valid for the specified criteria. Please try again.",
                            ).then(ask);
                        }
                    } else {
                        cleanupListeners();
                        bot.sendMessage(
                            chatId,
                            "The date entered is not valid. Please use the YYYY-MM-DD format.",
                        ).then(ask);
                    }
                }
            };

            const callbackQueryListener = (callbackQuery) => {
                if (callbackQuery.message.chat.id === chatId) {
                    const selectedValue = callbackQuery.data;
                    if (isValidDate(selectedValue)) {
                        if (!validate || validate(selectedValue)) {
                            bot.answerCallbackQuery(callbackQuery.id);
                            cleanupListeners();
                            resolve(selectedValue);
                        } else {
                            cleanupListeners();
                            bot.sendMessage(
                                chatId,
                                "The selected date is not valid for the specified criteria. Please try again.",
                            ).then(ask);
                        }
                    } else {
                        cleanupListeners();
                        bot.sendMessage(
                            chatId,
                            "The selected date is not valid. Please use the YYYY-MM-DD format.",
                        ).then(ask);
                    }
                }
            };

            const cleanupListeners = () => {
                bot.removeListener("message", messageListener);
                bot.removeListener("callback_query", callbackQueryListener);
            };

            cleanupListeners(); // Ensure no duplicate listeners before setting new ones
            bot.sendMessage(chatId, message, options).then(() => {
                bot.once("message", messageListener);

                if (inlineKeyboard.length > 0) {
                    bot.once("callback_query", callbackQueryListener);
                }
            });
        };
        ask();
    });
};

const printGroceryList = (groceryList) => {
    const aisleEmojis = {
        "Nut butters, Jams, and Honey": "🍯",
        "Spices and Seasonings": "🌶️",
        Cereal: "🥣",
        Baking: "🧁",
        "Milk, Eggs, Other Dairy": "🥛",
        Meat: "🍖",
        "Alcoholic Beverages": "🍷",
        "Ethnic Foods": "🍜",
        Produce: "🥦",
        "Pasta and Rice": "🍝",
        "Bakery/Bread": "🍞",
        Condiments: "🫙",
        Seafood: "🦞",
        Beverages: "🧃",
        Cheese: "🧀",
        Nuts: "🥜",
        "Health Foods": "🥗",
        "Gluten Free": "🌾",
        Gourmet: "🍽️",
        "Sweet Snacks": "🍫",
        "Canned and Jarred": "🥫",
    };

    let output = "🛒 *Grocery List*\n\n";

    for (const [aisle, products] of Object.entries(groceryList)) {
        const emoji = aisleEmojis[aisle] || "📂"; // Default emoji if aisle not found
        output += `${emoji} *${escapeMarkdownV2(aisle)}*\n`;

        products.forEach((product) => {
            const name = product.name.charAt(0).toUpperCase() + product.name.slice(1);
            const escapedName = escapeMarkdownV2(name);
            const roundedAmount = Math.ceil(product.amount * 100) / 100; // Round up to 2 decimal places
            const escapedAmount = escapeMarkdownV2(roundedAmount.toString());
            const escapedUnit = escapeMarkdownV2(product.unit);

            output += `\\- ${escapedName}: ${escapedAmount} ${escapedUnit}\n`;
        });

        output += "\n"; // Add a blank line between aisles
    }

    return output;
};

const askForValidInteger = (bot, chatId, message, inlineKeyboard = [], validate = null) => {
    const isValidInteger = (input) => {
        const parsed = parseInt(input, 10);
        return !isNaN(parsed) && Number.isInteger(parsed);
    };

    return new Promise((resolve) => {
        const ask = () => {
            const options =
                inlineKeyboard.length > 0
                    ? {
                          reply_markup: {
                              inline_keyboard: inlineKeyboard,
                          },
                      }
                    : {};

            const messageListener = (msg) => {
                if (msg.chat.id === chatId) {
                    if (isValidInteger(msg.text)) {
                        const parsedValue = parseInt(msg.text, 10);
                        if (!validate || validate(parsedValue)) {
                            cleanupListeners();
                            resolve(parsedValue);
                        } else {
                            cleanupListeners();
                            bot.sendMessage(
                                chatId,
                                "The number entered is not valid for the specified criteria. Please try again.",
                            ).then(ask);
                        }
                    } else {
                        cleanupListeners();
                        bot.sendMessage(
                            chatId,
                            "The input is not a valid integer. Please enter a valid number.",
                        ).then(ask);
                    }
                }
            };

            const callbackQueryListener = (callbackQuery) => {
                if (callbackQuery.message.chat.id === chatId) {
                    const selectedValue = callbackQuery.data;
                    if (isValidInteger(selectedValue)) {
                        const parsedValue = parseInt(selectedValue, 10);
                        if (!validate || validate(parsedValue)) {
                            bot.answerCallbackQuery(callbackQuery.id);
                            cleanupListeners();
                            resolve(parsedValue);
                        } else {
                            cleanupListeners();
                            bot.sendMessage(
                                chatId,
                                "The selected number is not valid for the specified criteria. Please try again.",
                            ).then(ask);
                        }
                    } else {
                        cleanupListeners();
                        bot.sendMessage(
                            chatId,
                            "The selected input is not a valid integer. Please enter a valid number.",
                        ).then(ask);
                    }
                }
            };

            const cleanupListeners = () => {
                bot.removeListener("message", messageListener);
                bot.removeListener("callback_query", callbackQueryListener);
            };

            cleanupListeners(); // Ensure no duplicate listeners before setting new ones
            bot.sendMessage(chatId, message, options).then(() => {
                bot.once("message", messageListener);

                if (inlineKeyboard.length > 0) {
                    bot.once("callback_query", callbackQueryListener);
                }
            });
        };
        ask();
    });
};

const sendLongMessage = async (bot, chatId, message) => {
    const MAX_LENGTH = 4000; // Telegram's maximum message length is 4096 characters, using 4000 to be safe

    // Split the message into chunks based on \n\n
    const chunks = [];
    while (message.length > MAX_LENGTH) {
        const splitIndex = message.lastIndexOf("\n\n", MAX_LENGTH);
        if (splitIndex === -1) {
            // If no \n\n is found, split at MAX_LENGTH
            chunks.push(message.slice(0, MAX_LENGTH));
            message = message.slice(MAX_LENGTH);
        } else {
            chunks.push(message.slice(0, splitIndex));
            message = message.slice(splitIndex + 2); // Skip the \n\n
        }
    }
    // Add the remaining part of the message
    if (message.length > 0) {
        chunks.push(message);
    }

    // Send each chunk sequentially, ensuring confirmation before sending the next
    for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk, { parse_mode: "MarkdownV2" });
    }
};

module.exports = {
    getUserDataByTelegramId,
    unlinkTelegramUser,
    printMealPlan,
    escapeMarkdownV2,
    askForValidDate,
    printGroceryList,
    askForValidInteger,
    sendLongMessage,
};
