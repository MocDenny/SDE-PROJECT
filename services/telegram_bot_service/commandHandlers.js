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

const newPlanCommand = (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    utils
        .getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                const lightCalories = 1500;
                const normalCalories = 2000;
                const highCalories = 2500;

                utils
                    .askForValidInteger(
                        bot,
                        chatId,
                        "How many daily calories do you want for your meal plan? Choose one of the options below or enter a custom value between 1200 and 3500:",
                        [
                            [
                                {
                                    text: "🥗 Light (1500 kcal)",
                                    callback_data: lightCalories.toString(),
                                },
                                {
                                    text: "🍛 Normal (2000 kcal)",
                                    callback_data: normalCalories.toString(),
                                },
                                {
                                    text: "🍔 High (2500 kcal)",
                                    callback_data: highCalories.toString(),
                                },
                            ],
                        ],
                        (calories) => calories >= 1200 && calories <= 3500,
                    )
                    .then((calories) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // set to midnight for accurate comparisons
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        const nextWeek = new Date(today);
                        nextWeek.setDate(today.getDate() + 7);

                        // Step 2: Ask for start date using the utility function
                        utils
                            .askForValidDate(
                                bot,
                                chatId,
                                "Please enter the start date (format: YYYY-MM-DD):",
                                [
                                    [
                                        {
                                            text: "Today",
                                            callback_data: today.toISOString().split("T")[0],
                                        },
                                    ],
                                    [
                                        {
                                            text: "Tomorrow",
                                            callback_data: tomorrow.toISOString().split("T")[0],
                                        },
                                    ],
                                    [
                                        {
                                            text: "Next Week",
                                            callback_data: nextWeek.toISOString().split("T")[0],
                                        },
                                    ],
                                ],
                                (date) => new Date(date) >= today,
                            )
                            .then((startDate) => {
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
                                            url: `http://${process.env.MEAL_PLANNER_CONTAINER}:${process.env.MEAL_PLANNER_PORT}/plan/new`,
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

const myPlansCommand = (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    utils
        .getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // set to midnight for accurate comparisons
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7);
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);

                utils
                    .askForValidDate(
                        bot,
                        chatId,
                        "To search for meal plans in a time range, please enter the start date (format: YYYY-MM-DD):",
                        [
                            [
                                {
                                    text: "Last Week",
                                    callback_data: lastWeek.toISOString().split("T")[0],
                                },
                            ],
                            [
                                {
                                    text: "Yesterday",
                                    callback_data: yesterday.toISOString().split("T")[0],
                                },
                                { text: "Today", callback_data: today.toISOString().split("T")[0] },
                                {
                                    text: "Tomorrow",
                                    callback_data: tomorrow.toISOString().split("T")[0],
                                },
                            ],
                            [
                                {
                                    text: "Next Week",
                                    callback_data: nextWeek.toISOString().split("T")[0],
                                },
                            ],
                        ],
                    )
                    .then((startDate) => {
                        utils
                            .askForValidDate(
                                bot,
                                chatId,
                                "Now enter the end date (format: YYYY-MM-DD):",
                                [
                                    [
                                        {
                                            text: "Last Week",
                                            callback_data: lastWeek.toISOString().split("T")[0],
                                        },
                                    ],
                                    [
                                        {
                                            text: "Yesterday",
                                            callback_data: yesterday.toISOString().split("T")[0],
                                        },
                                        {
                                            text: "Today",
                                            callback_data: today.toISOString().split("T")[0],
                                        },
                                        {
                                            text: "Tomorrow",
                                            callback_data: tomorrow.toISOString().split("T")[0],
                                        },
                                    ],
                                    [
                                        {
                                            text: "Next Week",
                                            callback_data: nextWeek.toISOString().split("T")[0],
                                        },
                                    ],
                                ],
                                (endDate) => new Date(endDate) >= new Date(startDate),
                            )
                            .then((endDate) => {
                                // fetch meal plans from meal planner service
                                axios({
                                    method: "get",
                                    url: `http://${process.env.MEAL_PLANNER_CONTAINER}:${process.env.MEAL_PLANNER_PORT}/plan`,
                                    params: {
                                        email: email,
                                        date_from: startDate || undefined,
                                        date_to: endDate || undefined,
                                    },
                                })
                                    .then((resp) => {
                                        const plans = resp.data;
                                        //console.log("Retrieved plans: " + JSON.stringify(plans));
                                        if (plans.length === 0) {
                                            bot.sendMessage(
                                                chatId,
                                                "You have no saved meal plans in the specified date range.",
                                            );
                                        } else {
                                            plans.forEach((plan) => {
                                                bot.sendMessage(
                                                    chatId,
                                                    utils.printMealPlan(plan.menu, false),
                                                    { parse_mode: "MarkdownV2" },
                                                );
                                            });
                                        }
                                    })
                                    .catch((error) => {
                                        bot.sendMessage(
                                            chatId,
                                            "An error occurred while retrieving your meal plans.",
                                        );
                                        console.log("[myPlansCommand] Error: " + error.message);
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

const groceryListCommand = (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id;

    utils
        .getUserDataByTelegramId(telegramUserId)
        .then((email) => {
            if (email) {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // set to midnight for accurate comparisons
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const inThreeDays = new Date(today);
                inThreeDays.setDate(today.getDate() + 3);
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);

                utils
                    .askForValidDate(
                        bot,
                        chatId,
                        "From which date do you want to see the grocery list? Please enter the start date (format: YYYY-MM-DD):",
                        [
                            [
                                { text: "Today", callback_data: today.toISOString().split("T")[0] },
                                {
                                    text: "Tomorrow",
                                    callback_data: tomorrow.toISOString().split("T")[0],
                                },
                            ],
                            [
                                {
                                    text: "In 3 Days",
                                    callback_data: inThreeDays.toISOString().split("T")[0],
                                },
                                {
                                    text: "Next Week",
                                    callback_data: nextWeek.toISOString().split("T")[0],
                                },
                            ],
                        ],
                        (date) => new Date(date) >= today,
                    )
                    .then((startDate) => {
                        utils
                            .askForValidDate(
                                bot,
                                chatId,
                                "Now enter the end date (format: YYYY-MM-DD):",
                                [
                                    [
                                        {
                                            text: "Today",
                                            callback_data: today.toISOString().split("T")[0],
                                        },
                                        {
                                            text: "Tomorrow",
                                            callback_data: tomorrow.toISOString().split("T")[0],
                                        },
                                    ],
                                    [
                                        {
                                            text: "In 3 Days",
                                            callback_data: inThreeDays.toISOString().split("T")[0],
                                        },
                                        {
                                            text: "Next Week",
                                            callback_data: nextWeek.toISOString().split("T")[0],
                                        },
                                    ],
                                ],
                                (endDate) => new Date(endDate) >= new Date(startDate),
                            )
                            .then((endDate) => {
                                // fetch grocery list from meal planner service
                                axios({
                                    method: "get",
                                    url: `http://${process.env.GROCERY_LIST_CONTAINER}:${process.env.GROCERY_LIST_PORT}/groceryList`,
                                    params: {
                                        email: email,
                                        date_from: startDate,
                                        date_to: endDate,
                                    },
                                })
                                    .then((resp) => {
                                        const groceryList = resp.data.list_content;
                                        if (groceryList.length === 0) {
                                            bot.sendMessage(
                                                chatId,
                                                "Your grocery list is currently empty.",
                                            );
                                        } else {
                                            utils
                                                .sendLongMessage(
                                                    bot,
                                                    chatId,
                                                    utils.printGroceryList(groceryList),
                                                )
                                                .then(() => {
                                                    // send auth url
                                                    bot.sendMessage(
                                                        chatId,
                                                        "To add the shopping list to your Google Calendar, log in with [this link](" +
                                                            resp.data.auth_url +
                                                            ")",
                                                        { parse_mode: "MarkdownV2" },
                                                    );
                                                });
                                        }
                                    })
                                    .catch((error) => {
                                        bot.sendMessage(
                                            chatId,
                                            "An error occurred while retrieving your grocery list.",
                                        );
                                        console.log("[groceryListCommand] Error: " + error.message);
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
    newPlanCommand,
    myPlansCommand,
    groceryListCommand,
    unlinkCommand,
};
