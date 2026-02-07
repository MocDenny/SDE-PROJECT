const express = require("express");
const { optimize_grocery_list } = require("./controllers");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Grocery Optimization Service API",
            version: "1.0.0",
            description: "APIs for optimizing grocery lists based on meal plans",
        },
        servers: [
            {
                url: "http://localhost:" + process.env.GROCERY_OPT_PORT,
                description: "Local server",
            },
        ],
    },
    apis: ["./controllers.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// define route to get personalized nutrition goals (i.e calories division + diet + intolerances)
app.post("/optimizeList", optimize_grocery_list);

app.listen(process.env.GROCERY_OPT_PORT, function () {
    console.log(`Service listening on port ${process.env.GROCERY_OPT_PORT}`);
    console.log(
        `API documentation available at http://localhost:${process.env.GROCERY_OPT_PORT}/api-docs`,
    );
});
