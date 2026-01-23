const express = require('express');
const mongoose = require('mongoose')
// controller import
const {post_user, get_user_pref} = require('./controllers.js')

// database connection
// for testing
CONNECTION_STRING='mongodb+srv://meal_planner_user:1tGGhzYWBJG6J8jp@cluster0.5jvdo6b.mongodb.net/meal_planner_db'

mongoose.connect(CONNECTION_STRING)
.catch(error => {
    console.log("Database connection error: " + error)
});

const app = express();
app.use(express.json())
app.use(cors());

// define routes
app.post("/user", post_user)
app.get("/pref", get_user_pref)

app.listen(3002, function () {
    console.log("Server listening on port 3002");
});