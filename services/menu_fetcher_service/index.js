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
            description:
                "APIs for building meal plans based on user preferences. <br>This service belongs to the Business Logic Services layer and is responsible for fetching meal options based on user preferences and caloric intake. It is called by the Meal Planner Service to get new meal options when generating a meal plan. This service houses the core business logic for meal plan generation, ensuring that the generated meal options are tailored to the user's needs and preferences.",
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
app.get("/menu", get_menu);

app.listen(process.env.MENU_FETCHER_PORT, function () {
    console.log(`Service listening on port ${process.env.MENU_FETCHER_PORT}`);
    console.log(
        `API documentation available at http://localhost:${process.env.MENU_FETCHER_PORT}/api-docs`,
    );
});
