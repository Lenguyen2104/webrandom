const mysql = require("mysql2");

const connection = mysql.createConnection({
  // host: "localhost",
  // user: "root",
  // password: "Mrdau6879@",
  // database: "dbLottery",
  host: "103.54.153.110",
  user: "dblottery",
  password: "dblottery",
  database: "dblottery",
});
connection.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối: " + err.stack);
    return;
  }
  console.log("Đã kết nối với MySQL với id " + connection.threadId);
});

module.exports = connection;
