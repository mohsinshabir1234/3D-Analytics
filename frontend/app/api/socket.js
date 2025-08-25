import { WebSocketServer } from 'ws';

export const config = {
  api: {
    bodyParser: false, // Required for WebSocket upgrade
  },
};

let wss;

export default function handler(req, res) {
  if (!wss) {
    // Initialize WS server only once
    wss = new WebSocketServer({ noServer: true });

    // Handle connection
    wss.on('connection', (ws) => {
      console.log('Client connected to live-stats WS');

      ws.on('message', (message) => {
        console.log('Received from client:', message);
      });

      ws.send(JSON.stringify({ event: 'connected', msg: 'Welcome to 3D logs WS' }));
    });

    // Upgrade HTTP request to WS
    req.socket.server.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  }

  res.status(200).end();
}
