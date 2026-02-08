const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// controller import
const {
    post_user,
    get_user_pref,
    get_user,
    get_user_by_token,
    patch_user,
    get_user_by_telegram_id,
    get_user_by_telegram_data,
} = require("./controllers.js");

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
            title: "User Data Service API",
            version: "1.0.0",
            description:
                "APIs to manage users data. <br>This service belongs to the Data Services layer and is responsible for storing user data in the database. It serves as a foundational service that other services can interact with to retrieve or update user information. Since the Data Services layer is the lowest and most concrete layer, this service does not communicate directly with the client (frontend) but rather provides data to other services that do.",
        },
        servers: [
            {
                url: "http://localhost:3002",
                description: "Local server",
            },
        ],
    },
    apis: ["./controllers.js"], // Percorso ai file con i commenti JSDoc
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// define routes
app.post("/user", post_user);
app.get("/user", get_user_by_telegram_data);
app.get("/user/:email/", get_user);
app.get("/user/:email/preferences", get_user_pref);
app.patch("/user/:email", patch_user);

app.listen(process.env.USER_DATA_PORT, function () {
    console.log(`Service listening on port ${process.env.USER_DATA_PORT}`);
});
