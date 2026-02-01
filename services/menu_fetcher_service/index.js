const express = require("express");
const { get_menu } = require("./controllers");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Menu Fetcher Service API",
            version: "1.0.0",
            description: "APIs for fetching personalized weekly menus",
        },
        servers: [
            {
                url: "http://localhost:" + process.env.MENU_FETCHER_PORT,
                description: "Local server",
            },
        ],
    },
    apis: ["./controllers.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// define route to get 2 personalized meal plans for the week
app.get(
    "/menu/:min_cal_breakfast/:max_cal_breakfast/:min_cal_other/:max_cal_other/:diet/:intolerances",
    get_menu,
);

app.listen(process.env.MENU_FETCHER_PORT, function () {
    console.log(`Service listening on port ${process.env.MENU_FETCHER_PORT}`);
    console.log(
        `API documentation available at http://localhost:${process.env.MENU_FETCHER_PORT}/api-docs`,
    );
});
