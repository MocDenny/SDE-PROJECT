const express = require("express");
const cors = require("cors");
// controller import
const { login, signup, telegram_link_account } = require("./controllers.js");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Authentication Service API",
            version: "1.0.0",
            description: "APIs for user authentication and account linking",
        },
        servers: [
            {
                url: "http://localhost:" + process.env.AUTH_PORT,
                description: "Local server",
            },
        ],
    },
    apis: ["./controllers.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// define routes
app.post("/login", login);
app.post("/signup", signup);
app.post("/telegram_link", telegram_link_account);

app.listen(process.env.AUTH_PORT, function () {
    console.log(`Service listening on port ${process.env.AUTH_PORT}`);
    console.log(
        `API documentation available at http://localhost:${process.env.AUTH_PORT}/api-docs`,
    );
});
