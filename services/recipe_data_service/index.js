const express = require('express');
const mongoose = require('mongoose')
// controller import
const {post_recipe} = require('./controllers.js')

// database connection
// for testing
CONNECTION_STRING='mongodb+srv://meal_planner_user:1tGGhzYWBJG6J8jp@cluster0.5jvdo6b.mongodb.net/meal_planner_db'

mongoose.connect(CONNECTION_STRING)
.catch(error => {
    console.log("Database connection error: " + error)
});

const app = express();
app.use(express.json())

// define routes
app.post("/recipe", post_recipe)

app.listen(3001, function () {
    console.log("Server listening on port 3001");
});