# Crypto Data Dashboard

A real-time cryptocurrency data dashboard built with React, TypeScript, and Tailwind CSS. Displays live candlestick charts and order book data streamed from a mock Node.js backend via WebSocket, with REST API fallback for historical data.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple)

## Project Overview

This dashboard provides a simplified crypto exchange view with:

- **Live Candlestick Chart** — powered by TradingView's [lightweight-charts](https://github.com/tradingview/lightweight-charts) library, updating in real-time every 3 seconds
- **Real-time Order Book** — split asks (red) / bids (green) display with depth visualization, cumulative totals, mid-price, and spread
- **Pair & Stream Selection** — switch between BTC-USDT, ETH-USDT, and XRP-USDT with stream filtering (All, Candles Only, Order Book Only)
- **Client-side Caching** — historical candle data is cached per pair to avoid redundant API calls on pair re-selection
- **Auto WebSocket Management** — automatic connection, subscription handling, and reconnection with retry logic

## Repository Structure

```
├── server/                 # Mock Node.js backend (provided)
│   ├── src/
│   │   ├── server.js       # Express + WebSocket server
│   │   └── data-generator.js
│   ├── package.json
│   └── README.md           # Backend API documentation
├── src/                    # React frontend application
│   ├── types/              # TypeScript interfaces and type constants
│   ├── services/           # REST API client
│   ├── hooks/              # Custom React hooks (WebSocket)
│   ├── context/            # Global state management (Context + useReducer)
│   ├── components/         # UI components + unit tests
│   ├── App.tsx             # Root layout with responsive grid
│   └── main.tsx            # Application entry point
├── package.json            # Frontend dependencies and scripts
├── vite.config.ts          # Vite config with API proxy + test config
├── tailwind.config.js      # Tailwind theme with custom colors
└── README.md               # This file
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (functional components + hooks) |
| Language | TypeScript (strict mode) |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 3.4 |
| Charting | TradingView lightweight-charts 4 |
| State Management | React Context + useReducer |
| Testing | Vitest + React Testing Library |
| Backend | Node.js + Express + WebSocket (provided) |

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**

### 1. Start the Backend Server

```bash
cd server
npm install
npm start
# Server runs on http://localhost:3001
```

### 2. Start the Frontend Dashboard

Open a second terminal:

```bash
# From the project root (not the server directory)
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `localhost:3001` automatically — no CORS issues in development.

### 3. Run Tests

```bash
npm test            # Run all tests once
npm run test:watch  # Run tests in watch mode
```

### 4. Production Build

```bash
npm run build     # TypeScript check + Vite build
npm run preview   # Preview production build locally
```

## Frontend Architecture

```
src/
├── types/
│   └── index.ts            # Candle, OrderBook, WSMessage, AppState types
├── services/
│   └── api.ts              # REST client: fetchCandles(), fetchOrderBook()
├── hooks/
│   └── useWebSocket.ts     # WebSocket lifecycle, auto-reconnect, subscription
├── context/
│   └── CryptoContext.tsx    # useReducer state + data fetching + WS coordination
├── components/
│   ├── Header.tsx           # Pair/stream dropdowns + connection status
│   ├── CandleChart.tsx      # TradingView candlestick chart
│   ├── OrderBook.tsx        # Order book with depth bars + mid-price
│   ├── ConnectionStatus.tsx # Color-coded WebSocket status indicator
│   ├── ErrorBanner.tsx      # Dismissible error notifications
│   ├── LoadingSpinner.tsx   # Loading state indicator
│   └── __tests__/           # Unit tests for all components
├── App.tsx                  # Dashboard layout with responsive grid
└── main.tsx                 # React entry point
```

### Data Flow

1. **On page load**: Connect to WebSocket, subscribe to `BTC-USDT` + `all` streams, fetch historical candles and order book snapshot via REST API
2. **On pair change**: Dispatch `SET_PAIR` → load cached candles (or fetch via REST if first visit) → fetch fresh order book → re-subscribe WebSocket to new pair
3. **On stream change**: Only toggle component visibility — WebSocket always subscribes to `all` to maintain a continuous data stream (no reconnection needed, as specified in requirements)
4. **Real-time updates**: WebSocket `candle_update` messages append to the candle array; `orderbook_update` messages replace the current order book state

### Client-side Caching Strategy

Historical candle data is stored in a `candleCache` map keyed by crypto pair. When switching back to a previously viewed pair, cached data is displayed instantly while real-time updates continue via WebSocket. The order book is always fetched fresh since it represents a point-in-time snapshot that becomes stale quickly.

## Assumptions & Trade-offs

- **WebSocket subscribes to `all` regardless of stream selection** — The UI filters what to display based on the selected stream type. This avoids unnecessary WebSocket reconnections when only the stream type changes, exactly as specified in the requirements.
- **Order book is not cached on pair switch** — Unlike candle data, the order book is a live snapshot that becomes stale quickly. A fresh REST fetch on pair change ensures accuracy.
- **Chart uses append-only updates** — New candles are appended to the array. The chart uses TradingView's `update()` method for real-time candles and `setData()` for full data resets on pair change.
- **Reconnection limit** — WebSocket reconnection attempts are capped at 5 with a 3-second delay between retries. After max retries, the UI shows an error state.
- **Vite proxy for development** — API calls are proxied to `localhost:3001` in development. For production deployment, a reverse proxy or CORS-enabled backend would be needed.
- **REST API for initial data** — Although the WebSocket server sends `initial_candles` and `initial_orderbook` upon subscription, the app primarily relies on REST for initial historical data as recommended in the requirements document.

## Bonus Features Implemented

- **Loading indicators** — Overlay spinners on the chart and order book during data fetching
- **Connection status indicator** — Color-coded dot (green/yellow/red/gray) showing WebSocket connection state in the header
- **Error handling** — Dismissible error banners for API failures and WebSocket errors
- **Chart interaction** — Zoom, pan, and crosshair enabled via lightweight-charts
- **Depth visualization** — Order book rows show proportional depth bars based on cumulative volume
- **Spread display** — Shows absolute and percentage spread between best bid and best ask
- **Responsive design** — Desktop shows side-by-side chart + order book; mobile stacks vertically
- **Unit tests** — 25 tests covering components, API service, and type constants

## Running Tests

```bash
# Run all 25 tests
npm test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- **OrderBook component** — rendering states, mid-price calculation, spread display, bid/ask prices
- **ConnectionStatus** — all 4 connection states with correct indicator colors
- **LoadingSpinner** — default and custom labels, spinner animation
- **ErrorBanner** — message display and dismiss callback
- **API service** — successful fetches and error handling for both endpoints
- **Type constants** — pair/stream enum validation

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run all unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
