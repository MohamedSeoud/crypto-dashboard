# Crypto Data Dashboard

A real-time cryptocurrency data dashboard built with React, TypeScript, and Tailwind CSS. Displays live candlestick charts and order book data streamed from a mock Node.js backend via WebSocket, with REST API fallback for historical data.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple)

## Project Overview

This dashboard provides a simplified crypto exchange view with:

- **Live Candlestick Chart** — powered by TradingView's [lightweight-charts](https://github.com/nicehash/lightweight-charts) library, updating in real-time every 3 seconds
- **Real-time Order Book** — split asks (red) / bids (green) display with depth visualization, cumulative totals, mid-price, and spread
- **Pair & Stream Selection** — switch between BTC-USDT, ETH-USDT, and XRP-USDT with stream filtering (All, Candles Only, Order Book Only)
- **Client-side Caching** — historical candle data is cached per pair to avoid redundant API calls on pair re-selection
- **Auto WebSocket Management** — automatic connection, subscription handling, and reconnection with retry logic

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

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- The mock backend server (provided separately)

### 1. Start the Backend Server

```bash
cd crypto-mock-server
npm install
npm start
# Server runs on http://localhost:3001
```

### 2. Start the Frontend Dashboard

```bash
cd crypto-dashboard
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `localhost:3001` automatically.

### 3. Run Tests

```bash
npm test            # Run all tests once
npm run test:watch  # Run tests in watch mode
```

### 4. Production Build

```bash
npm run build     # TypeScript check + Vite build
npm run preview   # Preview production build
```

## Architecture

```
src/
├── types/              # TypeScript interfaces and type constants
│   └── index.ts
├── services/           # REST API client
│   └── api.ts
├── hooks/              # Custom React hooks
│   └── useWebSocket.ts # WebSocket lifecycle management
├── context/            # Global state management
│   └── CryptoContext.tsx
├── components/         # UI components
│   ├── Header.tsx          # Pair/stream selectors + connection status
│   ├── CandleChart.tsx     # TradingView candlestick chart
│   ├── OrderBook.tsx       # Order book with depth bars
│   ├── ConnectionStatus.tsx # WebSocket status indicator
│   ├── ErrorBanner.tsx     # Dismissible error notifications
│   ├── LoadingSpinner.tsx  # Loading state indicator
│   └── __tests__/          # Component unit tests
├── App.tsx             # Root layout with responsive grid
└── main.tsx            # Application entry point
```

### Data Flow

1. **On page load**: Connect to WebSocket, subscribe to `BTC-USDT` + `all` streams, fetch historical candles and order book via REST API
2. **On pair change**: Dispatch `SET_PAIR` action → load cached candles (or fetch via REST) → fetch fresh order book → re-subscribe WebSocket to new pair
3. **On stream change**: Only toggle component visibility — WebSocket always subscribes to `all` to maintain a continuous connection (no reconnection needed)
4. **Real-time updates**: WebSocket `candle_update` messages append to the candle array; `orderbook_update` messages replace the order book state

### Client-side Caching Strategy

Historical candle data is stored in a `candleCache` map keyed by crypto pair. When switching back to a previously viewed pair, cached data is displayed instantly while real-time updates continue via WebSocket. The order book is always fetched fresh since it represents a point-in-time snapshot.

## Assumptions & Trade-offs

- **WebSocket subscribes to `all` regardless of stream selection** — The UI filters what to display based on the selected stream type. This avoids unnecessary WebSocket reconnections when only the stream type changes, as specified in the requirements.
- **Order book is not cached on pair switch** — Unlike candle data, the order book is a live snapshot that becomes stale quickly. A fresh REST fetch on pair change ensures accuracy.
- **Chart uses append-only updates** — New candles are appended to the array. The chart uses TradingView's `update()` method for real-time candles and `setData()` for full resets on pair change.
- **Reconnection limit** — WebSocket reconnection attempts are capped at 5 with a 3-second delay. After max retries, the UI shows an error state.
- **Vite proxy for development** — API calls are proxied to `localhost:3001` in development. For production, a reverse proxy or CORS-enabled backend would be needed.

## Bonus Features Implemented

- **Loading indicators** — Overlay spinners on the chart and order book during data fetching
- **Connection status indicator** — Color-coded dot (green/yellow/red/gray) showing WebSocket state
- **Error handling** — Dismissible error banners for API failures and WebSocket errors
- **Chart interaction** — Zoom, pan, and crosshair enabled via lightweight-charts
- **Depth visualization** — Order book rows show proportional depth bars based on cumulative volume
- **Spread display** — Shows absolute and percentage spread between best bid and best ask
- **Responsive design** — Desktop shows side-by-side chart + order book; mobile stacks vertically
- **Unit tests** — 25 tests covering components, API service, and type constants

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode with detailed output
npm run test:watch
```

Test coverage includes:
- **OrderBook component** — rendering states, mid-price calculation, spread display
- **ConnectionStatus** — all 4 connection states with correct colors
- **LoadingSpinner** — default and custom labels
- **ErrorBanner** — message display and dismiss callback
- **API service** — successful fetches and error handling
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
