const express = require("express");
const { get_info } = require("./controllers");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Nutrition Goals Service API",
            version: "1.0.0",
            description:
                "APIs for fetching and calculating personalized nutrition goals. <br>This service belongs to the Business Logic Services layer and is responsible for processing user data and preferences to generate nutrition goals. It communicates with the Data Services layer to retrieve user information and preferences, and with the Process Centric Services layer to provide important information for meal plan generation.",
        },
        servers: [
            {
                url: "http://localhost:" + process.env.NUTRITION_GOALS_PORT,
                description: "Local server",
            },
        ],
    },
    apis: ["./controllers.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// define route to get personalized nutrition goals (i.e calories division + diet + intolerances)
app.get("/goals", get_info);

app.listen(process.env.NUTRITION_GOALS_PORT, function () {
    console.log(`Service listening on port ${process.env.NUTRITION_GOALS_PORT}`);
    console.log(
        `API documentation available at http://localhost:${process.env.NUTRITION_GOALS_PORT}/api-docs`,
    );
});
