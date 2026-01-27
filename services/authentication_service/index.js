const express = require("express");
// controller import
const { login, signup, telegram_link_account } = require("./controllers.js");

const app = express();
app.use(express.json());

// define routes
app.get("/login", login);
app.post("/signup", signup);
app.post("/telegram_link", telegram_link_account);

app.listen(3006, function () {
    console.log("Server listening on port 3006");
});
