// server.js
"use strict";

const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const { initWebSocketServer } = require("./wsManager");
const lotteryRoutes = require("./api/routes");
require("dotenv").config();

const app = express();
const httpPort = process.env.HTTP_PORT || 3001;
const wsPort = process.env.WS_PORT || 3002;

// Middleware to parse JSON body
app.use(cors(null, true)); // CORS middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize WebSocket server
initWebSocketServer(wsPort);

// Use router
app.use("/api/lottery", lotteryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send({ url: req.originalUrl + " not found" });
});

// Error handling middleware (optional but useful)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start HTTP server
const server = http.createServer(app);

server.listen(httpPort, () => {
  // console.log(`Server running at http://localhost:${httpPort}`);
});
