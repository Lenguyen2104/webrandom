// routes/lotteryRoutes.js
"use strict";

const express = require("express");
const router = express.Router();
const lotteryController = require("./controllers/lotteryController");

router.post("/generate", lotteryController.generateLotteryData);

router.get("/results", lotteryController.getResultsLotteryData);

router.put("/update", lotteryController.updateLotteryData);

module.exports = router;
