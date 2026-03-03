export const CRYPTO_PAIRS = ['BTC-USDT', 'ETH-USDT', 'XRP-USDT'] as const;
export type CryptoPair = (typeof CRYPTO_PAIRS)[number];

export const STREAM_TYPES = ['all', 'candles', 'orderbook'] as const;
export type StreamType = (typeof STREAM_TYPES)[number];

export const STREAM_LABELS: Record<StreamType, string> = {
  all: 'All (Candles & Order Book)',
  candles: 'Candles Only',
  orderbook: 'Order Book Only',
};

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface SubscribeMessage {
  type: 'subscribe';
  pair: CryptoPair;
  stream: StreamType;
}

export interface InitialCandlesMessage {
  type: 'initial_candles';
  pair: CryptoPair;
  data: Candle[];
}

export interface InitialOrderBookMessage {
  type: 'initial_orderbook';
  pair: CryptoPair;
  data: OrderBook;
}

export interface CandleUpdateMessage {
  type: 'candle_update';
  pair: CryptoPair;
  data: Candle;
}

export interface OrderBookUpdateMessage {
  type: 'orderbook_update';
  pair: CryptoPair;
  data: OrderBook;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type WSMessage =
  | InitialCandlesMessage
  | InitialOrderBookMessage
  | CandleUpdateMessage
  | OrderBookUpdateMessage
  | ErrorMessage;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface AppState {
  selectedPair: CryptoPair;
  selectedStream: StreamType;
  connectionStatus: ConnectionStatus;
  candleCache: Partial<Record<CryptoPair, Candle[]>>;
  currentCandles: Candle[];
  currentOrderBook: OrderBook | null;
  isLoadingCandles: boolean;
  isLoadingOrderBook: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_PAIR'; pair: CryptoPair }
  | { type: 'SET_STREAM'; stream: StreamType }
  | { type: 'SET_CONNECTION_STATUS'; status: ConnectionStatus }
  | { type: 'SET_CANDLES'; pair: CryptoPair; candles: Candle[] }
  | { type: 'ADD_CANDLE'; pair: CryptoPair; candle: Candle }
  | { type: 'SET_ORDER_BOOK'; orderBook: OrderBook }
  | { type: 'SET_LOADING_CANDLES'; loading: boolean }
  | { type: 'SET_LOADING_ORDER_BOOK'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'CLEAR_ORDER_BOOK' };
