const express = require('express');
const mongoose = require('mongoose')
// controller import
const {post_recipe, post_plan} = require('./controllers.js')

// database connection

mongoose.connect(process.env.CONNECTION_STRING)
.catch(error => {
    console.log("Database connection error: " + error)
});

const app = express();
app.use(express.json())

// define routes
app.post("/recipe", post_recipe)
app.post("/plan", post_plan)

app.listen(3001, function () {
    console.log("Server listening on port 3001");
});