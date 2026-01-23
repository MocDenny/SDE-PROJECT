const express = require('express');
const {get_menu} = require('./controllers')

const app = express();
app.use(express.json());

// define route to get 2 personalized meal plans for the week 
app.get("/menu", get_menu);

app.listen(3004, function () {
    console.log("Service listening on port 3004");
});