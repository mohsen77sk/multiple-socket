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

const symbols = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA'];

const previousPrices = {};
symbols.forEach((symbol) => {
  previousPrices[symbol] = (Math.random() * 1000).toFixed(2);
});

function generateRandomData() {
  return symbols.map((symbol) => {
    const previousPrice = parseFloat(previousPrices[symbol]);
    const changePercent = (Math.random() * 2 - 1) / 100;
    const newPrice = previousPrice * (1 + changePercent);
    previousPrices[symbol] = newPrice.toFixed(2);

    return {
      symbol,
      price: newPrice.toFixed(2),
      volume: Math.floor(Math.random() * 10000),
    };
  });
}

setInterval(() => {
  const data = generateRandomData();
  io.emit('stock-data', data);
}, 1000);

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

server.on('error', console.error);
