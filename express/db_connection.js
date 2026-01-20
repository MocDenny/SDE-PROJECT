// db connection here
const pkg = require("pg");
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "meal_planner_db",
});

module.exports = pool;
