const express = require("express");
const { get_grocery_list, oauth2callback } = require("./controllers");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Grocery List Service API",
            version: "1.0.0",
            description:
                "APIs for managing grocery lists. <br>This service belongs to the Process Centric Services layer and orchestrates the services involved in grocery list functionalities. It communicates directly with the client (frontend) to provide optimized grocery lists based on the meal plans created by users. It calls the Grocery Optimization Service to perform the optimization logic and generate the final grocery list.",
        },
        servers: [
            {
                url: "http://localhost:" + process.env.GROCERY_LIST_PORT,
                description: "Local server",
            },
        ],
    },
    apis: ["./controllers.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// define route to get personalized nutrition goals (i.e calories division + diet + intolerances)
app.get("/groceryList", get_grocery_list);
app.get("/callback", oauth2callback);

app.listen(process.env.GROCERY_LIST_PORT, function () {
    console.log(`Service listening on port ${process.env.GROCERY_LIST_PORT}`);
    console.log(
        `API documentation available at http://localhost:${process.env.GROCERY_LIST_PORT}/api-docs`,
    );
});
