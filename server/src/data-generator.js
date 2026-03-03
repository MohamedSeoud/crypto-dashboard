const { faker } = require('@faker-js/faker');

const getRandom = (min, max) => faker.number.float({ min, max, precision: 0.01 });

let initialPrice = 40000;

const generateCandle = (lastCandle) => {
    const open = lastCandle ? lastCandle.close : initialPrice;
    const volume = faker.number.int({ min: 100, max: 5000 });

    const priceChange = getRandom(-open * 0.005, open * 0.005);
    let close = open + priceChange;

    let high = Math.max(open, close, open + getRandom(0, open * 0.002), close + getRandom(0, close * 0.002));
    let low = Math.min(open, close, open - getRandom(0, open * 0.002), close - getRandom(0, close * 0.002));

    if (high < low) {
        [high, low] = [low, high];
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
        const timestamp = Date.now() - (count - 1 - i) * 60 * 1000;

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
    initialPrice = currentPrice;
    return candles;
};

const initializeOrderBook = (depth = 10) => {
    const bids = [];
    const asks = [];
    let currentPrice = initialPrice;

    for (let i = 0; i < depth; i++) {
        const price = currentPrice - (i * getRandom(0.01, 0.5));
        bids.push({
            price: parseFloat(price.toFixed(2)),
            quantity: faker.number.float({ min: 0.1, max: 10, precision: 0.001 })
        });
    }

    for (let i = 0; i < depth; i++) {
        const price = currentPrice + (i * getRandom(0.01, 0.5));
        asks.push({
            price: parseFloat(price.toFixed(2)),
            quantity: faker.number.float({ min: 0.1, max: 10, precision: 0.001 })
        });
    }

    bids.sort((a, b) => b.price - a.price);
    asks.sort((a, b) => a.price - b.price);

    return { bids, asks };
};

const generateOrderBookUpdate = (currentOrderBook) => {
    const newBids = [...currentOrderBook.bids];
    const newAsks = [...currentOrderBook.asks];

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

    newBids.sort((a, b) => b.price - a.price);
    newAsks.sort((a, b) => a.price - b.price);

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
