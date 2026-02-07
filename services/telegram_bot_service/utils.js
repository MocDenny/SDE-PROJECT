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

const askForValidDate = (bot, chatId, message) => {
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
            bot.sendMessage(chatId, message).then(() => {
                bot.once("message", (msg) => {
                    if (msg.chat.id === chatId) {
                        if (isValidDate(msg.text)) {
                            resolve(msg.text);
                        } else {
                            bot.sendMessage(
                                chatId,
                                "La data inserita non è valida. Per favore, usa il formato YYYY-MM-DD.",
                            ).then(ask);
                        }
                    }
                });
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

module.exports = {
    getUserDataByTelegramId,
    unlinkTelegramUser,
    printMealPlan,
    escapeMarkdownV2,
    askForValidDate,
    printGroceryList,
};
