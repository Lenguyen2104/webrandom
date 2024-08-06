// routes/lotteryRoutes.js
"use strict";

const express = require("express");
const router = express.Router();
const lotteryController = require("./controllers/lotteryController");

router.get("/get", lotteryController.getLotteryData);

router.get("/get-data-admin", lotteryController.getAdminLotteryData);

router.post("/update-data", lotteryController.updateLotteryData);

module.exports = router;
