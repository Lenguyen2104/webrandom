// wsManager.js
const WebSocket = require("ws");

let clients = [];
let lotteryData = [];

const initWebSocketServer = (port) => {
  const wss = new WebSocket.Server({ port });

  console.log(`WebSocket server running on ws://localhost:${port}`);

  wss.on("connection", (ws) => {
    clients.push(ws);
    console.log("Client connected");

    ws.on("message", (message) => {
      console.log("Received message:", message);

      try {
        const { type, prize, oldNumber, newNumber } = JSON.parse(message);

        if (type === "updateNumber") {
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

          // Broadcast updated lottery data to all clients
          broadcastLotteryData(lotteryData);
        }

        // Respond to the client
        ws.send(`Server received: ${message}`);
      } catch (error) {
        console.error("Error processing message:", error);
        ws.send("Error processing message");
      }
    });

    ws.on("close", () => {
      clients = clients.filter((client) => client !== ws);
      console.log("Client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket Error:", error);
    });
  });

  return wss;
};

const broadcastLotteryData = (data) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = { initWebSocketServer, broadcastLotteryData, clients };
