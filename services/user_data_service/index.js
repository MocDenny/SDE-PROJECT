const express = require("express");
const mongoose = require("mongoose");
// controller import
const { post_user, get_user_pref, get_user } = require("./controllers.js");

// database connection
mongoose.connect(process.env.CONNECTION_STRING).catch((error) => {
    console.log("Database connection error: " + error);
});

const app = express();
app.use(express.json());

// define routes
app.post("/user", post_user);
app.get("/user", get_user);
app.get("/pref", get_user_pref);

app.listen(3002, function () {
    console.log("Server listening on port 3002");
});
