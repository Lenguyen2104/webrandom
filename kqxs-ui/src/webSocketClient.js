// web.js
"use client";

let ws;

const connectWebSocket = () => {
  ws = new WebSocket("ws://localhost:3002/user");

  ws.onopen = () => {
    // console.log("Connected to WebSocket server as user");
  };

  ws.onmessage = (event) => {
    try {
      const updatedData = JSON.parse(event.data);
      if (typeof window !== "undefined" && window.handleWebSocketData) {
        window.handleWebSocketData(updatedData);
      }
    } catch (error) {
      console.error("Error parsing WebSocket data:", error);
    }
  };

  ws.onclose = () => {
    // console.log(
    //   "Disconnected from WebSocket server. Attempting to reconnect..."
    // );
    setTimeout(connectWebSocket, 1000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};

connectWebSocket();

export default ws;
