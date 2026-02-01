const express = require("express");
const { get_recipes } = require("./controllers");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Recipe Adapter Service API",
            version: "1.0.0",
            description: "APIs for fetching recipes based on user preferences",
        },
        servers: [
            {
                url: "http://localhost:" + process.env.RECIPE_ADAPTER_PORT,
                description: "Local server",
            },
        ],
    },
    apis: ["./controllers.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// define routes
app.get("/recipes/:type/:min_cal/:max_cal/:diet/:intolerances/:number", get_recipes);

app.listen(process.env.RECIPE_ADAPTER_PORT, function () {
    console.log(`Service listening on port ${process.env.RECIPE_ADAPTER_PORT}`);
    console.log(
        `API documentation available at http://localhost:${process.env.RECIPE_ADAPTER_PORT}/api-docs`,
    );
});
