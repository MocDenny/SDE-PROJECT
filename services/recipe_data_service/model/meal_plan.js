const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const planSchema = new Schema(
    {
        // for the 7 days
        menu: [
            {
                day: { type: Date, required: true },
                breakfast: { type: mongoose.Schema.ObjectId, ref: "Recipe", required: true },
                lunch: { type: mongoose.Schema.ObjectId, ref: "Recipe", required: true },
                dinner: { type: mongoose.Schema.ObjectId, ref: "Recipe", required: true },
            },
        ],
        // for which user?
        user: [{ type: mongoose.Schema.ObjectId, ref: "User", required: true }],
    },
    {
        // saves date of creation and update
        timestamps: true,
    },
);

const meal_plan_model = model("MealPlan", planSchema);

module.exports = { meal_plan_model };
