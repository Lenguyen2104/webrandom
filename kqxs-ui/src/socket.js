// "use client";

// let ws;

// const connectWebSocket = () => {
//   ws = new WebSocket("ws://localhost:3002");

//   ws.onopen = () => {
//     console.log("Connected to WebSocket server");
//   };

//   ws.onmessage = (event) => {
//     try {
//       const updatedData = JSON.parse(event.data);
//       console.log("Received updated data:", updatedData);
//       if (typeof window !== "undefined" && window.handleWebSocketData) {
//         window.handleWebSocketData(updatedData);
//       }
//     } catch (error) {
//       console.error("Error parsing WebSocket data:", error);
//     }
//   };

//   ws.onclose = () => {
//     console.log(
//       "Disconnected from WebSocket server. Attempting to reconnect..."
//     );
//     setTimeout(connectWebSocket, 2000);
//   };

//   ws.onerror = (error) => {
//     console.error("WebSocket error:", error);
//   };
// };

// connectWebSocket();

// export default ws;

"use client";

let ws;

const connectWebSocket = () => {
  ws = new WebSocket("ws://localhost:3002");

  ws.onopen = () => {
    console.log("Connected to WebSocket server");
  };

  ws.onmessage = (event) => {
    try {
      const updatedData = JSON.parse(event.data);
      console.log("Received updated data:", updatedData);
      if (typeof window !== "undefined" && window.handleWebSocketData) {
        window.handleWebSocketData(updatedData);
      }
    } catch (error) {
      console.error("Error parsing WebSocket data:", error);
    }
  };

  ws.onclose = () => {
    console.log(
      "Disconnected from WebSocket server. Attempting to reconnect..."
    );
    setTimeout(connectWebSocket, 2000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};

connectWebSocket();

export default ws;
