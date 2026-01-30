const express = require("express");
const cors = require("cors");
// controller import
const { login, signup, telegram_link_account } = require("./controllers.js");

const app = express();
app.use(cors());
app.use(express.json());

// define routes
app.post("/login", login);
app.post("/signup", signup);
app.post("/telegram_link", telegram_link_account);

app.listen(process.env.AUTH_PORT, function () {
    console.log(`Service listening on port ${process.env.AUTH_PORT}`);
});
