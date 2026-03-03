const { faker } = require('@faker-js/faker');

// Helper to generate a random number within a range
const getRandom = (min, max) => faker.number.float({ min, max, precision: 0.01 });

// Initial price for simulation
let initialPrice = 40000; // BTC/USD starting point

// Function to generate a single candle (OHLCV)
const generateCandle = (lastCandle) => {
    const open = lastCandle ? lastCandle.close : initialPrice;
    const volume = faker.number.int({ min: 100, max: 5000 });

    // Simulate price movement
    const priceChange = getRandom(-open * 0.005, open * 0.005); // +/- 0.5%
    let close = open + priceChange;

    let high = Math.max(open, close, open + getRandom(0, open * 0.002), close + getRandom(0, close * 0.002));
    let low = Math.min(open, close, open - getRandom(0, open * 0.002), close - getRandom(0, close * 0.002));

    // Ensure high is always >= low
    if (high < low) {
        [high, low] = [low, high]; // Swap if inverted
    }

    const timestamp = Date.now();

    return {
        timestamp: timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volume
    };
};

// Function to initialize historical candle data
const initializeCandleData = (count = 100) => {
    const candles = [];
    let currentPrice = initialPrice;
    for (let i = 0; i < count; i++) {
        const open = currentPrice;
        const priceChange = getRandom(-open * 0.005, open * 0.005);
        const close = open + priceChange;
        const high = Math.max(open, close, open + getRandom(0, open * 0.002));
        const low = Math.min(open, close, open - getRandom(0, open * 0.002));
        const volume = faker.number.int({ min: 100, max: 5000 });
        const timestamp = Date.now() - (count - 1 - i) * 60 * 1000; // Simulate 1-minute intervals

        candles.push({
            timestamp: timestamp,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: volume
        });
        currentPrice = close;
    }
    initialPrice = currentPrice; // Update initial price for the next pair
    return candles;
};

// Function to initialize an order book
const initializeOrderBook = (depth = 10) => {
    const bids = [];
    const asks = [];
    let currentPrice = initialPrice; // Use the last candle's close as a reference

    // Generate bids
    for (let i = 0; i < depth; i++) {
        const price = currentPrice - (i * getRandom(0.01, 0.5)); // Decreasing prices
        bids.push({
            price: parseFloat(price.toFixed(2)),
            quantity: faker.number.float({ min: 0.1, max: 10, precision: 0.001 })
        });
    }

    // Generate asks
    for (let i = 0; i < depth; i++) {
        const price = currentPrice + (i * getRandom(0.01, 0.5)); // Increasing prices
        asks.push({
            price: parseFloat(price.toFixed(2)),
            quantity: faker.number.float({ min: 0.1, max: 10, precision: 0.001 })
        });
    }

    // Sort bids descending by price, asks ascending by price
    bids.sort((a, b) => b.price - a.price);
    asks.sort((a, b) => a.price - b.price);

    return { bids, asks };
};

// Function to simulate order book updates (simplified)
const generateOrderBookUpdate = (currentOrderBook) => {
    const newBids = [...currentOrderBook.bids];
    const newAsks = [...currentOrderBook.asks];

    // Simulate a small number of changes
    const numChanges = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numChanges; i++) {
        const type = faker.helpers.arrayElement(['add', 'remove', 'change']);
        const side = faker.helpers.arrayElement(['bid', 'ask']);
        const targetArray = side === 'bid' ? newBids : newAsks;

        if (type === 'add') {
            const referencePrice = side === 'bid' ? newBids[0].price : newAsks[0].price;
            const newPrice = side === 'bid' ? referencePrice - getRandom(0.01, 0.1) : referencePrice + getRandom(0.01, 0.1);
            targetArray.push({
                price: parseFloat(newPrice.toFixed(2)),
                quantity: faker.number.float({ min: 0.05, max: 5, precision: 0.001 })
            });
        } else if (type === 'remove' && targetArray.length > 1) {
            const indexToRemove = faker.number.int({ min: 0, max: targetArray.length - 1 });
            targetArray.splice(indexToRemove, 1);
        } else if (type === 'change' && targetArray.length > 0) {
            const indexToChange = faker.number.int({ min: 0, max: targetArray.length - 1 });
            targetArray[indexToChange].quantity = faker.number.float({ min: 0.01, max: 10, precision: 0.001 });
        }
    }

    // Re-sort after changes
    newBids.sort((a, b) => b.price - a.price);
    newAsks.sort((a, b) => a.price - b.price);

    // Trim to a reasonable depth
    const maxDepth = 10;
    const trimmedBids = newBids.slice(0, maxDepth);
    const trimmedAsks = newAsks.slice(0, maxDepth);

    return { bids: trimmedBids, asks: trimmedAsks };
};

module.exports = {
    generateCandle,
    generateOrderBookUpdate,
    initializeCandleData,
    initializeOrderBook
};
