import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3003;
const io = new Server(server, { transports: ['websocket'] });

app.get('/', (req, res) => {
  res.send('<p>Welcome to socket-api-3</p>');
});

io.on('connection', (socket) => {
  console.log('a user connected to socket-api-3');
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

server.on('error', console.error);
