import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const appName = 'Socket API 1';
const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;
const io = new Server(server, { transports: ['websocket'] });

app.get('/', (req, res) => {
  res.send(`<p>Welcome to ${appName}</p>`);
});

io.on('connection', (socket) => {
  console.log(`a user connected to ${appName}`);
});

setInterval(() => {
  const timestamp = new Date().toLocaleTimeString();
  const message = `Broadcast message sent at ${timestamp} from ${appName}`;

  io.emit('broadcastMessage', message);
  console.log('Broadcast message sent:', message);
}, 5000);

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

server.on('error', console.error);
