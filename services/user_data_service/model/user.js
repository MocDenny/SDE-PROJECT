const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
    email: String,
    password: String,
    telegramLinkToken: String,
    telegramUserId: String,
    preferences: {
        diet: {
            type: String,
            enum: ["ketogenic", "", "vegan", "vegeterian", "pescaterian", "paleo"],
        },
        intolerances: [
            {
                type: String,
                enum: [
                    "gluten",
                    "dairy",
                    "egg",
                    "peanut",
                    "wheat",
                    "shellfish",
                    "sesame",
                    "soy",
                    "grain",
                ],
            },
        ],
    },
});

const user_model = model("User", userSchema);

module.exports = { user_model };
