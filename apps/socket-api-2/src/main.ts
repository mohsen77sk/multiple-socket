import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const appName = 'Socket API 2';
const app = express();
const server = createServer(app);
const port = process.env.PORT || 3002;
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
}, 5000);

setInterval(() => {
  const timestamp = new Date().toLocaleTimeString('fa-IR');
  const message = `${timestamp}`;

  io.emit('time', message);
}, 1000);

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

server.on('error', console.error);
