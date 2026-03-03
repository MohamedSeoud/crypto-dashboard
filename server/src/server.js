const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const { generateCandle, generateOrderBookUpdate, initializeCandleData, initializeOrderBook } = require('./data-generator');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;
const CRYPTO_PAIRS = ['BTC-USDT', 'ETH-USDT', 'XRP-USDT'];

// Store current candle and order book data for each pair
const currentCandles = {};
const currentOrderBooks = {};

// Store client subscriptions
const clientSubscriptions = new Map(); // ws -> { pair: string, stream: string }

// Initialize data for all pairs
CRYPTO_PAIRS.forEach(pair => {
    currentCandles[pair] = initializeCandleData();
    currentOrderBooks[pair] = initializeOrderBook();
});

app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));

// Serve static files (optional, for a simple frontend later)
app.use(express.static('public'));

// REST API endpoint for historical candle data
app.get('/api/candles/:pair', (req, res) => {
    const { pair } = req.params;
    if (currentCandles[pair]) {
        res.json(currentCandles[pair]);
    } else {
        res.status(404).send('Crypto pair not found or no candle data available.');
    }
});

// REST API endpoint for initial order book snapshot
app.get('/api/orderbook/:pair', (req, res) => {
    const { pair } = req.params;
    if (currentOrderBooks[pair]) {
        res.json(currentOrderBooks[pair]);
    } else {
        res.status(404).send('Crypto pair not found or no order book data available.');
    }
});

// WebSocket server for real-time data streaming
wss.on('connection', ws => {
    console.log('Client connected to WebSocket.');

    ws.on('message', message => {
        const parsedMessage = JSON.parse(message);
        console.log('Received message from client:', parsedMessage);

        if (parsedMessage.type === 'subscribe') {
            const { pair, stream } = parsedMessage;
            if (CRYPTO_PAIRS.includes(pair)) {
                console.log(`Client subscribed to ${stream} for ${pair}`);
                
                // Store the client's subscription
                clientSubscriptions.set(ws, { pair, stream });
                
                // Send initial data upon subscription
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
        // Clean up subscription when client disconnects
        clientSubscriptions.delete(ws);
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
        // Clean up subscription on error
        clientSubscriptions.delete(ws);
    });
});

// Simulate real-time data updates and broadcast to connected clients
setInterval(() => {
    CRYPTO_PAIRS.forEach(pair => {
        // Update candle data
        const newCandle = generateCandle(currentCandles[pair][currentCandles[pair].length - 1]);
        currentCandles[pair].push(newCandle);
        // Keep only the last 100 candles for historical data
        if (currentCandles[pair].length > 100) {
            currentCandles[pair].shift();
        }

        // Update order book data
        const updatedOrderBook = generateOrderBookUpdate(currentOrderBooks[pair]);
        currentOrderBooks[pair] = updatedOrderBook;

        // Broadcast updates only to subscribed clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                const subscription = clientSubscriptions.get(client);
                
                // Only send updates if client is subscribed to this pair
                if (subscription && subscription.pair === pair) {
                    // Send candle update if subscribed to candles or all
                    if (subscription.stream === 'candles' || subscription.stream === 'all') {
                        client.send(JSON.stringify({ type: 'candle_update', pair, data: newCandle }));
                    }
                    
                    // Send order book update if subscribed to orderbook or all
                    if (subscription.stream === 'orderbook' || subscription.stream === 'all') {
                        client.send(JSON.stringify({ type: 'orderbook_update', pair, data: updatedOrderBook }));
                    }
                }
            }
        });
    });
}, 3000); // Update every 3 seconds for demonstration

server.listen(PORT, () => {
    console.log(`Mock crypto server listening on port ${PORT}`);
    console.log(`HTTP Endpoints:`);
    console.log(`  GET /api/candles/:pair (e.g., /api/candles/BTC/USD)`);
    console.log(`  GET /api/orderbook/:pair (e.g., /api/orderbook/ETH/USD)`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
});
