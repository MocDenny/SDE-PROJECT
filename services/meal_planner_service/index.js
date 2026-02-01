const express = require("express");
const { get_meal_plan, save_meal_plan } = require("./controllers");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Meal Planner Service API",
            version: "1.0.0",
            description: "APIs for generating and saving meal plans",
        },
        servers: [
            {
                url: "http://localhost:" + process.env.MEAL_PLANNER_PORT,
                description: "Local server",
            },
        ],
    },
    apis: ["./controllers.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// define route to get the meal plan
app.get("/plan/:email/:calories", get_meal_plan);
// define route to save the meal plan
app.post("/plan", save_meal_plan);

app.listen(process.env.MEAL_PLANNER_PORT, function () {
    console.log(`Service listening on port ${process.env.MEAL_PLANNER_PORT}`);
    console.log(
        `API documentation available at http://localhost:${process.env.MEAL_PLANNER_PORT}/api-docs`,
    );
});
