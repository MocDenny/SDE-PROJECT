const express = require("express");
const mongoose = require("mongoose");
// controller import
const { post_recipe, post_plan, get_plan } = require("./controllers.js");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// database connection
mongoose.connect(process.env.CONNECTION_STRING).catch((error) => {
    console.log("Database connection error: " + error);
});

const app = express();
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Recipe Data Service API",
            version: "1.0.0",
            description:
                "APIs for managing recipe and meal plan data in the application database. <br>This service belongs to the Data Services layer and is responsible for managing the application's data related to recipes and meal plans. Since the Data Services layer is the lowest and most concrete layer, this service does not communicate directly with the client (frontend) but is instead called by the Business Logic Services layer when needed.",
        },
        servers: [
            {
                url: "http://localhost:" + process.env.RECIPE_DATA_PORT,
                description: "Local server",
            },
        ],
    },
    apis: ["./controllers.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// define routes
app.post("/recipe", post_recipe);
app.post("/plan", post_plan);
app.get("/plan", get_plan);

app.listen(process.env.RECIPE_DATA_PORT, function () {
    console.log(`Server listening on port ${process.env.RECIPE_DATA_PORT}`);
    console.log(
        `API documentation available at http://localhost:${process.env.RECIPE_DATA_PORT}/api-docs`,
    );
});
