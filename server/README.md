# Crypto Mock Server

A Node.js Express server that provides mock cryptocurrency data for testing and development purposes. This server offers both REST API endpoints for historical data and WebSocket connections for real-time data streaming.

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation and Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Documentation

### Available Crypto Pairs
- `BTC-USDT`
- `ETH-USDT` 
- `XRP-USDT`

### REST API Endpoints

#### Get Historical Candle Data
```
GET /api/candles/:pair
```
Returns an array of historical candle data for the specified crypto pair.

**Example:**
```bash
curl http://localhost:3001/api/candles/BTC-USDT
```

#### Get Order Book Snapshot
```
GET /api/orderbook/:pair
```
Returns the current order book snapshot for the specified crypto pair.

**Example:**
```bash
curl http://localhost:3001/api/orderbook/BTC-USDT
```

## WebSocket Real-time Data

### Connection
Connect to the WebSocket server at:
```
ws://localhost:3001
```

### Subscription
To receive real-time data, send a subscription message after connecting:

```json
{
    "type": "subscribe",
    "pair": "BTC-USDT",
    "stream": "all"
}
```

**Parameters:**
- `type`: Must be `"subscribe"`
- `pair`: One of the available crypto pairs (`BTC-USDT`, `ETH-USDT`, `XRP-USDT`)
- `stream`: Subscription type
  - `"all"` - Receive both candle and orderbook updates
  - `"candles"` - Receive only candle updates
  - `"orderbook"` - Receive only orderbook updates

### Message Types

#### Initial Data (sent upon subscription)

**Initial Candles:**
```json
{
    "type": "initial_candles",
    "pair": "BTC-USDT",
    "data": [
        {
            "timestamp": 1691404800000,
            "open": 45000,
            "high": 45500,
            "low": 44800,
            "close": 45200,
            "volume": 123.45
        }
    ]
}
```

**Initial Order Book:**
```json
{
    "type": "initial_orderbook",
    "pair": "BTC-USDT",
    "data": {
        "bids": [
            {"price": 45000, "quantity": 1.5}
        ],
        "asks": [
            {"price": 45001, "quantity": 1.2}
        ]
    }
}
```

#### Real-time Updates (sent every 3 seconds)

**Candle Update:**
```json
{
    "type": "candle_update",
    "pair": "BTC-USDT",
    "data": {
        "timestamp": 1691404800000,
        "open": 45000,
        "high": 45500,
        "low": 44800,
        "close": 45200,
        "volume": 123.45
    }
}
```

**Order Book Update:**
```json
{
    "type": "orderbook_update",
    "pair": "BTC-USDT",
    "data": {
        "bids": [
            {"price": 45000, "quantity": 1.5},
            {"price": 44999, "quantity": 0.8}
        ],
        "asks": [
            {"price": 45001, "quantity": 1.2},
            {"price": 45002, "quantity": 2.1}
        ]
    }
}
```

#### Error Messages

```json
{
    "type": "error",
    "message": "Invalid crypto pair: INVALID-PAIR"
}
```

### Subscription Behavior

- **Selective Updates**: Clients only receive updates for the specific pair and stream they subscribed to
- **Initial Data**: Upon subscription, clients receive initial historical data (if available)
- **Real-time Updates**: Updates are sent every 3 seconds for subscribed data streams
- **Multiple Subscriptions**: Each client can subscribe to one pair and stream at a time
- **Automatic Cleanup**: Subscriptions are automatically removed when clients disconnect
