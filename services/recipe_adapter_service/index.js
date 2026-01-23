const express = require('express');

const app = express();
app.use(express.json());

// define routes

app.listen(3005, function () {
    console.log("Service listening on port 3005");
});