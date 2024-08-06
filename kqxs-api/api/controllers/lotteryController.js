"use strict";

const {
  broadcastLotteryDataToUsers,
  broadcastLotteryDataToAdmins,
} = require("../../wsManager");
const connection = require("../../db");

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

const getNextStage = (callback) => {
  connection.query(
    "SELECT MAX(stage) AS maxStage FROM lottery_stages",
    (err, results) => {
      if (err) {
        return callback(err);
      }

      const maxStage = results[0].maxStage;
      const nextStage = maxStage === null ? 1 : maxStage + 1;

      callback(null, nextStage);
    }
  );
};

exports.generateLotteryData = (req, res) => {
  lotteryData = generateRandomLotteryData();

  getNextStage((err, nextStage) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi máy chủ" });
    }

    const insertQuery =
      "INSERT INTO lottery_stages (stage, data) VALUES (?, ?)";
    const values = [nextStage, JSON.stringify(lotteryData)];

    connection.query(insertQuery, values, (err, results) => {
      if (err) {
        console.error("Lỗi khi lưu dữ liệu: " + err.stack);
        return res.status(500).json({ error: "Lỗi máy chủ" });
      }

      // Gửi dữ liệu cập nhật đến tất cả các WebSocket client admin
      broadcastLotteryDataToAdmins(lotteryData);
      broadcastLotteryDataToUsers(lotteryData);

      res.json(lotteryData);
    });
  });
};

exports.getResultsLotteryData = (req, res) => {
  // Truy vấn tất cả dữ liệu từ bảng lottery_stages
  connection.query(
    "SELECT * FROM lottery_stages ORDER BY stage ASC",
    (err, results) => {
      if (err) {
        console.error("Lỗi truy vấn: " + err.stack);
        return res.status(500).json({ error: "Lỗi máy chủ" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "No lottery data available." });
      }

      // Chuyển đổi dữ liệu từ JSON sang đối tượng nếu cần
      const lotteryData = results
        .map((row) => {
          try {
            // Kiểm tra kiểu dữ liệu của trường 'data'
            const data =
              typeof row.data === "string" ? JSON.parse(row.data) : row.data;

            return {
              stage: row.stage,
              data: data, // Đã là đối tượng
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            };
          } catch (error) {
            console.error("Lỗi khi phân tích JSON: ", error);
            return null; // Hoặc xử lý lỗi phù hợp
          }
        })
        .filter((item) => item !== null); // Loại bỏ các bản ghi không hợp lệ

      // Gửi dữ liệu cập nhật đến tất cả các WebSocket client
      broadcastLotteryDataToAdmins(lotteryData);

      res.json(lotteryData);
    }
  );
};

exports.updateLotteryData = (req, res) => {
  const { stage, updates } = req.body;

  // Kiểm tra thông tin cần thiết
  if (typeof stage !== "number" || !Array.isArray(updates)) {
    return res
      .status(400)
      .json({ error: "Thiếu thông tin cần thiết hoặc định dạng không hợp lệ" });
  }

  // Kiểm tra tính hợp lệ của từng phần tử cập nhật
  for (const update of updates) {
    if (
      typeof update.name !== "string" ||
      !Array.isArray(update.numbers) ||
      update.numbers.some((num) => typeof num !== "string")
    ) {
      return res.status(400).json({ error: "Dữ liệu cập nhật không hợp lệ" });
    }
  }

  // Truy vấn dữ liệu hiện tại của stage
  connection.query(
    "SELECT data FROM lottery_stages WHERE stage = ?",
    [stage],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi máy chủ" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Kỳ xổ số không tồn tại" });
      }

      let existingData = results[0].data;

      // Kiểm tra xem dữ liệu có phải là chuỗi JSON không
      if (typeof existingData === "string") {
        try {
          existingData = JSON.parse(existingData);
        } catch (error) {
          console.error("Lỗi khi phân tích JSON: ", error);
          return res
            .status(500)
            .json({ error: "Dữ liệu hiện tại không hợp lệ" });
        }
      }

      // Cập nhật dữ liệu
      updates.forEach((update) => {
        const index = existingData.findIndex(
          (item) => item.name === update.name
        );
        if (index !== -1) {
          existingData[index].numbers = update.numbers;
        }
      });

      // Chuyển đổi dữ liệu thành JSON
      const jsonData = JSON.stringify(existingData);

      // Cập nhật dữ liệu trong cơ sở dữ liệu
      const updateQuery =
        "UPDATE lottery_stages SET data = ?, updated_at = NOW() WHERE stage = ?";
      const values = [jsonData, stage];

      connection.query(updateQuery, values, (err, results) => {
        if (err) {
          console.error("Lỗi khi cập nhật dữ liệu: " + err.stack);
          return res.status(500).json({ error: "Lỗi máy chủ" });
        }

        broadcastLotteryDataToUsers(existingData);

        // Phản hồi thành công
        res.status(200).json({ message: "Cập nhật dữ liệu thành công" });
      });
    }
  );
};
