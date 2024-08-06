"use strict";

const { broadcastLotteryData } = require("../../wsManager");

let lotteryData = [];

const generateRandomNumber = (length) => {
  let number = "";
  for (let i = 0; i < length; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
};

const generateRandomLotteryData = () => {
  return [
    { name: "Đặc biệt", numbers: [generateRandomNumber(5)] },
    { name: "Giải nhất", numbers: [generateRandomNumber(5)] },
    {
      name: "Giải nhì",
      numbers: [generateRandomNumber(5), generateRandomNumber(5)],
    },
    {
      name: "Giải ba",
      numbers: [
        generateRandomNumber(5),
        generateRandomNumber(5),
        generateRandomNumber(5),
        generateRandomNumber(5),
        generateRandomNumber(5),
        generateRandomNumber(5),
      ],
    },
    {
      name: "Giải tư",
      numbers: [
        generateRandomNumber(4),
        generateRandomNumber(4),
        generateRandomNumber(4),
        generateRandomNumber(4),
      ],
    },
    {
      name: "Giải năm",
      numbers: [
        generateRandomNumber(4),
        generateRandomNumber(4),
        generateRandomNumber(4),
        generateRandomNumber(4),
        generateRandomNumber(4),
        generateRandomNumber(4),
      ],
    },
    {
      name: "Giải sáu",
      numbers: [
        generateRandomNumber(3),
        generateRandomNumber(3),
        generateRandomNumber(3),
      ],
    },
    {
      name: "Giải bảy",
      numbers: [
        generateRandomNumber(2),
        generateRandomNumber(2),
        generateRandomNumber(2),
        generateRandomNumber(2),
      ],
    },
  ];
};

exports.getLotteryData = (req, res) => {
  lotteryData = generateRandomLotteryData();
  res.json(lotteryData);

  // Send updated data to all connected WebSocket clients
  broadcastLotteryData(lotteryData);
};

exports.getAdminLotteryData = (req, res) => {
  if (lotteryData.length === 0) {
    return res
      .status(404)
      .json({ error: "No lottery data available. Please create data first." });
  }
  res.json(lotteryData);

  // Send updated data to all connected WebSocket clients
  broadcastLotteryData(lotteryData);
};

exports.updateLotteryData = (req, res) => {
  try {
    // Ensure the request body is correctly parsed as JSON
    const { type, prize, oldNumber, newNumber } = req.body;

    if (!type || !prize || !oldNumber || !newNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update the lottery data
    lotteryData = lotteryData.map((prizeObj) => {
      if (prizeObj.name === prize) {
        return {
          ...prizeObj,
          numbers: prizeObj.numbers.map((num) =>
            num === oldNumber ? newNumber : num
          ),
        };
      }
      return prizeObj;
    });

    // Broadcast updated data to WebSocket clients
    broadcastLotteryData(lotteryData);

    // Respond with the updated data
    res.status(200).json(lotteryData);
  } catch (error) {
    console.error("Error updating lottery data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
