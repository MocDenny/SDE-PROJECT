const express = require("express");
// controller import
const { login, signup, telegram_link_account } = require("./controllers.js");

const app = express();
app.use(express.json());

// define routes
app.get("/login", login);
app.post("/signup", signup);
app.post("/telegram_link", telegram_link_account);

app.listen(process.env.AUTH_PORT, function () {
    console.log(`Service listening on port ${process.env.AUTH_PORT}`);
});
