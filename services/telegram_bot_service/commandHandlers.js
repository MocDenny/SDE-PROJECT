const axios = require("axios");
const utils = require("./utils.js");

const startCommand = (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    utils
        .getUserDataByTelegramId(telegramUserId)
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
};

const startTokenCommand = (bot, msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const telegramUserId = msg.from.id;
    const chatId = msg.chat.id;
    const token = match[1];

    utils
        .getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                bot.sendMessage(
                    chatId,
                    `Hi! This Telegram account is already linked to user '${email}'. To learn more about using the Meal Planner bot, use the /help command. To unlink your account use the /unlink command.`,
                );
            } else {
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
                        bot.sendMessage(
                            telegramUserId,
                            "Your Telegram account has been linked successfully!",
                        );
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
            }
        })
        .catch((error) => {
            bot.sendMessage(chatId, "I'm sorry, an error occurred while retrieving your data.");
            console.log("[/start] Error while connecting to backend:" + error.message);
        });
};

const testInlineKeyboard = (bot, msg) => {
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
};

const newPlanCommand = (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    utils
        .getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                // Step 1: Ask for daily calories
                bot.sendMessage(chatId, "How many daily calories do you want for your meal plan?", {
                    reply_markup: {
                        force_reply: true,
                    },
                }).then((caloriesMessage) => {
                    bot.onReplyToMessage(chatId, caloriesMessage.message_id, (caloriesReply) => {
                        const calories = caloriesReply.text;

                        // Step 2: Ask for start date
                        bot.sendMessage(
                            chatId,
                            "Please enter the start date (format: YYYY-MM-DD):",
                            {
                                reply_markup: {
                                    force_reply: true,
                                },
                            },
                        ).then((dateMessage) => {
                            bot.onReplyToMessage(chatId, dateMessage.message_id, (dateReply) => {
                                const startDate = dateReply.text;

                                // Step 3: Ask for diet preference (optional)
                                const dietOptions = {
                                    reply_markup: {
                                        inline_keyboard: [
                                            [{ text: "My default", callback_data: "default" }],
                                            [
                                                { text: "No diet", callback_data: "none" },
                                                {
                                                    text: "Vegetarian",
                                                    callback_data: "vegetarian",
                                                },
                                                { text: "Vegan", callback_data: "vegan" },
                                            ],
                                            [
                                                {
                                                    text: "Pescatarian",
                                                    callback_data: "pescatarian",
                                                },
                                                { text: "Paleo", callback_data: "paleo" },
                                                { text: "Ketogenic", callback_data: "ketogenic" },
                                            ],
                                        ],
                                    },
                                };

                                bot.sendMessage(chatId, "Choose a diet (optional):", dietOptions);

                                bot.once("callback_query", (dietQuery) => {
                                    const diet =
                                        dietQuery.data === "default" ? undefined : dietQuery.data;
                                    bot.answerCallbackQuery(dietQuery.id);

                                    // Step 4: Ask for intolerances (optional)
                                    const intoleranceOptions = {
                                        reply_markup: {
                                            inline_keyboard: [
                                                [
                                                    {
                                                        text: "My default",
                                                        callback_data: "default",
                                                    },
                                                    { text: "None", callback_data: "none" },
                                                ],
                                                [
                                                    { text: "Gluten", callback_data: "gluten" },
                                                    { text: "Dairy", callback_data: "dairy" },
                                                    { text: "Eggs", callback_data: "eggs" },
                                                ],
                                                [
                                                    {
                                                        text: "Peanuts",
                                                        callback_data: "peanut",
                                                    },
                                                    { text: "Wheat", callback_data: "wheat" },
                                                    {
                                                        text: "Shellfish",
                                                        callback_data: "shellfish",
                                                    },
                                                ],
                                                [
                                                    { text: "Sesame", callback_data: "sesame" },
                                                    { text: "Soy", callback_data: "soy" },
                                                    { text: "Grain", callback_data: "grain" },
                                                ],
                                            ],
                                        },
                                    };

                                    bot.sendMessage(
                                        chatId,
                                        "Choose any intolerances (optional):",
                                        intoleranceOptions,
                                    );

                                    bot.once("callback_query", (intoleranceQuery) => {
                                        const intolerances =
                                            intoleranceQuery.data === "default"
                                                ? undefined
                                                : intoleranceQuery.data === "none"
                                                  ? ""
                                                  : intoleranceQuery.data;
                                        bot.answerCallbackQuery(intoleranceQuery.id);

                                        // Step 5: Call the meal planner service
                                        axios({
                                            method: "get",
                                            url: `http://${process.env.MEAL_PLANNER_CONTAINER}:${process.env.MEAL_PLANNER_PORT}/plan`,
                                            params: {
                                                email: email,
                                                calories: calories,
                                                start_date: startDate,
                                                diet: diet,
                                                intolerances: intolerances,
                                            },
                                        })
                                            .then((resp) => {
                                                const plans = resp.data; // Assuming the response contains two plans
                                                bot.sendMessage(
                                                    chatId,
                                                    "Here is your first meal plan:",
                                                )
                                                    .then(() =>
                                                        bot.sendMessage(
                                                            chatId,
                                                            utils.printMealPlan(
                                                                plans.plan_1,
                                                                false,
                                                            ),
                                                            { parse_mode: "MarkdownV2" },
                                                        ),
                                                    )
                                                    .then(() =>
                                                        bot.sendMessage(
                                                            chatId,
                                                            "Here is your second meal plan:",
                                                        ),
                                                    )
                                                    .then(() =>
                                                        bot.sendMessage(
                                                            chatId,
                                                            utils.printMealPlan(
                                                                plans.plan_2,
                                                                false,
                                                            ),
                                                            { parse_mode: "MarkdownV2" },
                                                        ),
                                                    )
                                                    .then(() => {
                                                        // Step 6: Let the user choose a plan or skip saving
                                                        const saveOptions = {
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    [
                                                                        {
                                                                            text: "Save Plan 1",
                                                                            callback_data:
                                                                                "save_plan_1",
                                                                        },
                                                                        {
                                                                            text: "Save Plan 2",
                                                                            callback_data:
                                                                                "save_plan_2",
                                                                        },
                                                                    ],
                                                                    [
                                                                        {
                                                                            text: "Do not save",
                                                                            callback_data:
                                                                                "do_not_save",
                                                                        },
                                                                    ],
                                                                ],
                                                            },
                                                        };

                                                        bot.sendMessage(
                                                            chatId,
                                                            "Would you like to save one of these plans?",
                                                            saveOptions,
                                                        );

                                                        bot.once("callback_query", (saveQuery) => {
                                                            if (saveQuery.data === "do_not_save") {
                                                                bot.sendMessage(
                                                                    chatId,
                                                                    "No meal plan was saved.",
                                                                );
                                                            } else {
                                                                const selectedPlan =
                                                                    saveQuery.data === "save_plan_1"
                                                                        ? plans.plan_1
                                                                        : plans.plan_2;

                                                                axios({
                                                                    method: "post",
                                                                    url: `http://${process.env.MEAL_PLANNER_CONTAINER}:${process.env.MEAL_PLANNER_PORT}/plan`,
                                                                    data: {
                                                                        email: email,
                                                                        plan: selectedPlan,
                                                                    },
                                                                })
                                                                    .then(() => {
                                                                        bot.sendMessage(
                                                                            chatId,
                                                                            "Your meal plan has been saved successfully!",
                                                                        );
                                                                    })
                                                                    .catch((error) => {
                                                                        bot.sendMessage(
                                                                            chatId,
                                                                            "An error occurred while saving the meal plan.",
                                                                        );
                                                                        console.log(
                                                                            "[newPlanCommand] Save Error: " +
                                                                                error.message,
                                                                        );
                                                                    });
                                                            }
                                                            bot.answerCallbackQuery(saveQuery.id);
                                                        });
                                                    });
                                            })
                                            .catch((error) => {
                                                bot.sendMessage(
                                                    chatId,
                                                    "An error occurred while generating the meal plan.",
                                                );
                                                console.log(
                                                    "[newPlanCommand] Error: " + error.message,
                                                );
                                            });
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                bot.sendMessage(
                    chatId,
                    "This Telegram account is not linked to any user. Please link your account first using the /start command.",
                );
            }
        })
        .catch((error) => {
            bot.sendMessage(chatId, "An error occurred while retrieving your data.");
        });
};

const unlinkCommand = (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    // before unlinking, check if the user is linked
    utils
        .getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                utils.unlinkTelegramUser(telegramUserId).then((successMessage) => {
                    bot.sendMessage(chatId, successMessage);
                });
            } else {
                bot.sendMessage(chatId, "This Telegram account is not linked to any user.");
            }
        })
        .catch((error) => {
            bot.sendMessage(chatId, "An error occurred while unlinking your account.");
        });
};

module.exports = {
    startCommand,
    startTokenCommand,
    testInlineKeyboard,
    newPlanCommand,
    unlinkCommand,
};
