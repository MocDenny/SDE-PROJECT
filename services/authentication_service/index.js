const express = require("express");
// controller import
const { telegram_link_account } = require("./controllers.js");

const app = express();
app.use(express.json());

// define routes
//app.get("/login");
//app.post("/signup");
app.post("/telegram_link", telegram_link_account);

app.listen(3006, function () {
    console.log("Server listening on port 3006");
});
