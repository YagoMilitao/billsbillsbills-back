const express = require("express");
const cors = require("cors");

const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes  = require("./routes/reportRoutes");

const app = express();

// Middlewares globais
app.use(cors());          // libera acesso do front e mobile
app.use(express.json());  // faz parse de JSON no body

// Rotas
app.use("/api/expenses", expenseRoutes);
app.use("/api/report", reportRoutes);

// Healthcheck
app.get("/", (_req, res) => res.send("gastosmensais API online"));

module.exports = app;
