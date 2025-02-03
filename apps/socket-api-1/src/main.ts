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
  console.log(`User ${socket.id} connected to ${appName}`);

  socket.on('joinWatchList', () => {
    socket.join('watchList');
    console.log(`User ${socket.id} joined watchlist of ${appName}`);
  });

  socket.on('leaveWatchList', () => {
    socket.leave('watchList');
    console.log(`User ${socket.id} left watchlist of ${appName}`);
  });

  socket.on('joinPortfolio', () => {
    socket.join('portfolio');
    console.log(`User ${socket.id} joined portfolio of ${appName}`);
  });

  socket.on('leavePortfolio', () => {
    socket.leave('portfolio');
    console.log(`User ${socket.id} left portfolio of ${appName}`);
  });
});

const symbolsWatchList = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA'];
const symbolsPortfolio = ['AAPL', 'AMZN', 'MSFT'];

const previousPrices = {};
symbolsWatchList.forEach((symbol) => {
  previousPrices[symbol] = (Math.random() * 1000).toFixed(2);
});

function generateWatchListData() {
  return symbolsWatchList.map((symbol) => {
    const previousPrice = parseFloat(previousPrices[symbol]);
    const changePercent = (Math.random() * 2 - 1) / 100;
    const newPrice = previousPrice * (1 + changePercent);
    previousPrices[symbol] = newPrice.toFixed(2);

    return {
      symbol,
      price: newPrice.toFixed(2),
      volume: Math.floor(Math.random() * 10000),
      changePercent: changePercent.toFixed(4),
    };
  });
}

function generatePortfolioData() {
  return symbolsPortfolio.map((symbol) => {
    const previousPrice = parseFloat(previousPrices[symbol]);
    const changePercent = (Math.random() * 2 - 1) / 100;
    const newPrice = previousPrice * (1 + changePercent);
    previousPrices[symbol] = newPrice.toFixed(2);

    return {
      symbol,
      price: newPrice.toFixed(2),
      volume: Math.floor(Math.random() * 10000),
      changePercent: changePercent.toFixed(4),
    };
  });
}

setInterval(() => {
  const data = generateWatchListData();
  io.to('watchList').emit('watchList-data', data);
}, 1000);

setInterval(() => {
  const data = generatePortfolioData();
  io.to('portfolio').emit('portfolio-data', data);
}, 1000);

setInterval(() => {
  const timestamp = new Date().toLocaleTimeString();
  const message = `Broadcast message sent at ${timestamp} from ${appName}`;

  io.emit('broadcastMessage', message);
}, 5000);

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

server.on('error', console.error);
