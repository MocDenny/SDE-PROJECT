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

app.listen(3006, function () {
    console.log("Server listening on port 3006");
});
