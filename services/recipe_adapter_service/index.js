const express = require('express');
const {get_recipes} = require('./controllers')

const app = express();
app.use(express.json());

// define routes
app.get('/recipes', get_recipes);

app.listen(3005, function () {
    console.log("Service listening on port 3005");
});