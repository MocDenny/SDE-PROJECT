const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const planSchema = new Schema(
    {
        // for the 7 days
        menu: [
            {
                breakfast: { type: mongoose.Schema.ObjectId, ref: "Recipe" },
                lunch: { type: mongoose.Schema.ObjectId, ref: "Recipe" },
                dinner: { type: mongoose.Schema.ObjectId, ref: "Recipe" },
            },
        ],
        // for which user?
        user: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    },
    {
        // saves date of creation and update
        timestamps: true,
    },
);

const meal_plan_model = model("MealPlan", planSchema);

module.exports = { meal_plan_model };
