const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const accepted_aisle = [
    "Baking",
    "Health Foods",
    "Spices and Seasonings",
    "Pasta and Rice",
    "Bakery/Bread",
    "Refrigerated",
    "Canned and Jarred",
    "Frozen",
    "Nut butters, Jams, and Honey",
    "Oil, Vinegar, Salad Dressing",
    "Condiments",
    "Savory Snacks",
    "Milk, Eggs, Other Dairy",
    "Ethnic Foods",
    "Tea and Coffee",
    "Meat",
    "Gourmet",
    "Sweet Snacks",
    "Gluten Free",
    "Alcoholic Beverages",
    "Cereal",
    "Nuts",
    "Beverages",
    "Produce",
    "Not in Grocery Store/Homemade",
    "Seafood",
    "Cheese",
    "Dried Fruits",
    "Online",
    "Grilling Supplies",
    "Bread",
];

const recipeSchema = new Schema({
    name: String,
    type: String,
    calories: Number,
    ingredients: [
        {
            amount: Number,
            unit: String,
            name: String,
            aisle: { type: String, enum: accepted_aisle },
        },
    ],
});

const recipe_model = model("Recipe", recipeSchema);

module.exports = { recipe_model };
