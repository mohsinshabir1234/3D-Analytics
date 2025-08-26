import { WebSocketServer } from "ws";

// Create WS server
const wss = new WebSocketServer({ port: 4000 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => console.log("Client disconnected"));
});

// Optional: function to broadcast messages to all clients
export function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
}

console.log("WebSocket server running on port 4000");
