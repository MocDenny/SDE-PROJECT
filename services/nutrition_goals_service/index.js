const express = require('express');
const {get_info} = require('./controllers')

const app = express();
app.use(express.json());

// define route to get personalized nutrition goals (i.e calories division + diet + intolerances)
app.get("/goals", get_info);

app.listen(3003, function () {
    console.log("Service listening on port 3003");
});