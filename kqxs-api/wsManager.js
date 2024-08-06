// // wsManager.js
// const WebSocket = require("ws");

// let clients = [];
// let lotteryData = [];

// const initWebSocketServer = (port) => {
//   const wss = new WebSocket.Server({ port });

//   console.log(`WebSocket server running on ws://localhost:${port}`);

//   wss.on("connection", (ws) => {
//     clients.push(ws);
//     console.log("Client connected");

//     ws.on("message", (message) => {
//       console.log("Received message:", message);

//       try {
//         const { type, prize, oldNumber, newNumber } = JSON.parse(message);

//         if (type === "updateNumber") {
//           lotteryData = lotteryData.map((prizeObj) => {
//             if (prizeObj.name === prize) {
//               return {
//                 ...prizeObj,
//                 numbers: prizeObj.numbers.map((num) =>
//                   num === oldNumber ? newNumber : num
//                 ),
//               };
//             }
//             return prizeObj;
//           });

//           // Broadcast updated lottery data to all clients
//           broadcastLotteryData(lotteryData);
//         }

//         // Respond to the client
//         ws.send(`Server received: ${message}`);
//       } catch (error) {
//         console.error("Error processing message:", error);
//         ws.send("Error processing message");
//       }
//     });

//     ws.on("close", () => {
//       clients = clients.filter((client) => client !== ws);
//       console.log("Client disconnected");
//     });

//     ws.on("error", (error) => {
//       console.error("WebSocket Error:", error);
//     });
//   });

//   return wss;
// };

// const broadcastLotteryData = (data) => {
//   clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(data));
//     }
//   });
// };

// module.exports = { initWebSocketServer, broadcastLotteryData, clients };

const WebSocket = require("ws");

let userClients = [];
let adminClients = [];
let lotteryData = [];

const initWebSocketServer = (port) => {
  const wss = new WebSocket.Server({ port });

  console.log(`WebSocket server running on ws://localhost:${port}`);

  wss.on("connection", (ws, req) => {
    console.log("Client connected");
    // Identify client type based on the URL path
    const pathname = new URL(req.url, `ws://localhost:${port}`).pathname;

    if (pathname === "/admin") {
      adminClients.push(ws);
      console.log("Admin client connected");
    } else if (pathname === "/user") {
      userClients.push(ws);
      console.log("User client connected");
    } else {
      ws.close(); // Close connection if not recognized
      return;
    }

    // ws.once("message", (message) => {
    //   if (message === "admin") {
    //     adminClients.push(ws);
    //   } else {
    //     userClients.push(ws);
    //   }
    // });

    ws.on("message", (message) => {
      console.log("Received message:", message);

      const messageString = message.toString();

      if (messageString === "admin") {
        console.log("Admin client connected");
        adminClients.push(ws);
      } else {
        try {
          const data = JSON.parse(messageString);
          console.log("Parsed data:", data);
          handleClientData(data);
        } catch (error) {
          console.error(
            "Error processing message:",
            error,
            "Received data:",
            messageString
          );
        }
      }

      // try {
      //   const { type, prize, oldNumber, newNumber } = JSON.parse(message);

      //   if (type === "updateNumber") {
      //     lotteryData = lotteryData.map((prizeObj) => {
      //       if (prizeObj.name === prize) {
      //         return {
      //           ...prizeObj,
      //           numbers: prizeObj.numbers.map((num) =>
      //             num === oldNumber ? newNumber : num
      //           ),
      //         };
      //       }
      //       return prizeObj;
      //     });

      //     // Broadcast updated lottery data to all user clients
      //     broadcastLotteryDataToUsers(lotteryData);

      //     // Notify admin clients about the update
      //     broadcastLotteryDataToAdmins(lotteryData);
      //   }

      //   // Respond to the client
      //   ws.send(`Server received: ${message}`);
      // } catch (error) {
      //   console.error("Error processing message:", error);
      //   ws.send("Error processing message");
      // }
    });

    ws.on("close", () => {
      if (pathname === "/admin") {
        adminClients = adminClients.filter(
          (client) => client.readyState === WebSocket.OPEN && client !== ws
        );
        console.log("Admin client disconnected");
      } else if (pathname === "/user") {
        userClients = userClients.filter(
          (client) => client.readyState === WebSocket.OPEN && client !== ws
        );
        console.log("User client disconnected");
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket Error:", error);
    });
  });

  return wss;
};

const handleClientData = (data) => {
  // Xử lý dữ liệu từ client
  console.log("Handling client data:", data);
};

const broadcastLotteryDataToUsers = (data) => {
  userClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const broadcastLotteryDataToAdmins = (data) => {
  adminClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = {
  broadcastLotteryDataToUsers,
  broadcastLotteryDataToAdmins,
  initWebSocketServer,
};
