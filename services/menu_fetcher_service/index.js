const express = require("express");
const { get_menu } = require("./controllers");

const app = express();
app.use(express.json());

// define route to get 2 personalized meal plans for the week
app.get(
    "/menu/:min_cal_breakfast/:max_cal_breakfast/:min_cal_other/:max_cal_other/:diet/:intolerances",
    get_menu,
);

app.listen(process.env.MENU_FETCHER_PORT, function () {
    console.log(`Service listening on port ${process.env.MENU_FETCHER_PORT}`);
});
