// admin.js
"use client";

let ws;

const connectWebSocket = () => {
  // const WB_SOCKET = process.env.REACT_APP_WB_SOCKET;
  ws = new WebSocket(`ws://103.54.153.110/socket/admin`);

  ws.onopen = () => {
    // console.log("Connected to WebSocket server as admin");
    ws.send("admin"); // Identifies as an admin client
  };

  ws.onmessage = (event) => {
    // console.log("Received WebSocket message:", event.data);

    try {
      const updatedData = JSON.parse(event.data);
      // console.log("Parsed WebSocket data:", updatedData);

      // if (typeof window !== "undefined" && window.handleAdminWebSocketData) {
      //   window.handleAdminWebSocketData(updatedData);
      // }
    } catch (error) {
      console.error(
        "Error parsing WebSocket data:",
        error,
        "Received data:",
        event.data
      );
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
