const express = require("express");
const mongoose = require("mongoose");
// controller import
const {
    post_user,
    get_user_pref,
    get_user,
    get_user_by_token,
    patch_user,
} = require("./controllers.js");

// database connection
mongoose.connect(process.env.CONNECTION_STRING).catch((error) => {
    console.log("Database connection error: " + error);
});

const app = express();
app.use(express.json());

// define routes
app.post("/user", post_user);
app.get("/user/:email/", get_user);
app.get("/userByToken/:token", get_user_by_token);
app.get("/user/pref/:email", get_user_pref);
app.patch("/user/:email", patch_user);

app.listen(process.env.USER_DATA_PORT, function () {
    console.log(`Service listening on port ${process.env.USER_DATA_PORT}`);
});
