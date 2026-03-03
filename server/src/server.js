const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const { generateCandle, generateOrderBookUpdate, initializeCandleData, initializeOrderBook } = require('./data-generator');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;
const CRYPTO_PAIRS = ['BTC-USDT', 'ETH-USDT', 'XRP-USDT'];

const currentCandles = {};
const currentOrderBooks = {};
const clientSubscriptions = new Map();

CRYPTO_PAIRS.forEach(pair => {
    currentCandles[pair] = initializeCandleData();
    currentOrderBooks[pair] = initializeOrderBook();
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

app.get('/api/candles/:pair', (req, res) => {
    const { pair } = req.params;
    if (currentCandles[pair]) {
        res.json(currentCandles[pair]);
    } else {
        res.status(404).send('Crypto pair not found or no candle data available.');
    }
});

app.get('/api/orderbook/:pair', (req, res) => {
    const { pair } = req.params;
    if (currentOrderBooks[pair]) {
        res.json(currentOrderBooks[pair]);
    } else {
        res.status(404).send('Crypto pair not found or no order book data available.');
    }
});

wss.on('connection', ws => {
    console.log('Client connected to WebSocket.');

    ws.on('message', message => {
        const parsedMessage = JSON.parse(message);
        console.log('Received message from client:', parsedMessage);

        if (parsedMessage.type === 'subscribe') {
            const { pair, stream } = parsedMessage;
            if (CRYPTO_PAIRS.includes(pair)) {
                console.log(`Client subscribed to ${stream} for ${pair}`);
                clientSubscriptions.set(ws, { pair, stream });

                if ((stream === 'candles' || stream === 'all') && currentCandles[pair]) {
                    ws.send(JSON.stringify({ type: 'initial_candles', pair, data: currentCandles[pair] }));
                }
                if ((stream === 'orderbook' || stream === 'all') && currentOrderBooks[pair]) {
                    ws.send(JSON.stringify({ type: 'initial_orderbook', pair, data: currentOrderBooks[pair] }));
                }
            } else {
                ws.send(JSON.stringify({ type: 'error', message: `Invalid crypto pair: ${pair}` }));
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket.');
        clientSubscriptions.delete(ws);
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
        clientSubscriptions.delete(ws);
    });
});

setInterval(() => {
    CRYPTO_PAIRS.forEach(pair => {
        const newCandle = generateCandle(currentCandles[pair][currentCandles[pair].length - 1]);
        currentCandles[pair].push(newCandle);
        if (currentCandles[pair].length > 100) {
            currentCandles[pair].shift();
        }

        const updatedOrderBook = generateOrderBookUpdate(currentOrderBooks[pair]);
        currentOrderBooks[pair] = updatedOrderBook;

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                const subscription = clientSubscriptions.get(client);

                if (subscription && subscription.pair === pair) {
                    if (subscription.stream === 'candles' || subscription.stream === 'all') {
                        client.send(JSON.stringify({ type: 'candle_update', pair, data: newCandle }));
                    }

                    if (subscription.stream === 'orderbook' || subscription.stream === 'all') {
                        client.send(JSON.stringify({ type: 'orderbook_update', pair, data: updatedOrderBook }));
                    }
                }
            }
        });
    });
}, 3000);

server.listen(PORT, () => {
    console.log(`Mock crypto server listening on port ${PORT}`);
    console.log(`HTTP Endpoints:`);
    console.log(`  GET /api/candles/:pair (e.g., /api/candles/BTC/USD)`);
    console.log(`  GET /api/orderbook/:pair (e.g., /api/orderbook/ETH/USD)`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
});
