import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { fetchCandles, fetchOrderBook } from '../services/api';
import type {
  AppAction,
  AppState,
  ConnectionStatus,
  CryptoPair,
  StreamType,
  WSMessage,
} from '../types';

const initialState: AppState = {
  selectedPair: 'BTC-USDT',
  selectedStream: 'all',
  connectionStatus: 'connecting',
  candleCache: {},
  currentCandles: [],
  currentOrderBook: null,
  isLoadingCandles: true,
  isLoadingOrderBook: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAIR':
      return {
        ...state,
        selectedPair: action.pair,
        currentCandles: state.candleCache[action.pair] ?? [],
        isLoadingCandles: !state.candleCache[action.pair],
        currentOrderBook: null,
        isLoadingOrderBook: true,
        error: null,
      };

    case 'SET_STREAM':
      return { ...state, selectedStream: action.stream };

    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.status };

    case 'SET_CANDLES':
      return {
        ...state,
        candleCache: { ...state.candleCache, [action.pair]: action.candles },
        currentCandles: state.selectedPair === action.pair ? action.candles : state.currentCandles,
        isLoadingCandles: state.selectedPair === action.pair ? false : state.isLoadingCandles,
      };

    case 'ADD_CANDLE': {
      if (action.pair !== state.selectedPair) return state;

      const updatedCandles = [...state.currentCandles, action.candle];
      return {
        ...state,
        currentCandles: updatedCandles,
        candleCache: { ...state.candleCache, [action.pair]: updatedCandles },
      };
    }

    case 'SET_ORDER_BOOK':
      return {
        ...state,
        currentOrderBook: action.orderBook,
        isLoadingOrderBook: false,
      };

    case 'CLEAR_ORDER_BOOK':
      return { ...state, currentOrderBook: null };

    case 'SET_LOADING_CANDLES':
      return { ...state, isLoadingCandles: action.loading };

    case 'SET_LOADING_ORDER_BOOK':
      return { ...state, isLoadingOrderBook: action.loading };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    default:
      return state;
  }
}

interface CryptoContextValue {
  state: AppState;
  setPair: (pair: CryptoPair) => void;
  setStream: (stream: StreamType) => void;
  clearError: () => void;
}

const CryptoContext = createContext<CryptoContextValue | null>(null);

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const prevPairRef = useRef<CryptoPair>(state.selectedPair);

  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'initial_candles':
      case 'initial_orderbook':
        break;
      case 'candle_update':
        dispatchRef.current({ type: 'ADD_CANDLE', pair: message.pair, candle: message.data });
        break;
      case 'orderbook_update':
        dispatchRef.current({ type: 'SET_ORDER_BOOK', orderBook: message.data });
        break;
      case 'error':
        dispatchRef.current({ type: 'SET_ERROR', error: message.message });
        break;
    }
  }, []);

  const handleStatusChange = useCallback((status: ConnectionStatus) => {
    dispatchRef.current({ type: 'SET_CONNECTION_STATUS', status });
    if (status === 'error') {
      dispatchRef.current({
        type: 'SET_ERROR',
        error: 'WebSocket connection failed. Retrying...',
      });
    }
  }, []);

  const { subscribe, isConnected } = useWebSocket({
    onMessage: handleMessage,
    onStatusChange: handleStatusChange,
  });

  const candleCacheRef = useRef(state.candleCache);
  candleCacheRef.current = state.candleCache;

  useEffect(() => {
    const pair = state.selectedPair;

    if (!candleCacheRef.current[pair]) {
      dispatch({ type: 'SET_LOADING_CANDLES', loading: true });
      fetchCandles(pair)
        .then((candles) => {
          dispatch({ type: 'SET_CANDLES', pair, candles });
        })
        .catch((err: Error) => {
          dispatch({ type: 'SET_ERROR', error: `Failed to load candle data: ${err.message}` });
          dispatch({ type: 'SET_LOADING_CANDLES', loading: false });
        });
    }

    dispatch({ type: 'SET_LOADING_ORDER_BOOK', loading: true });
    fetchOrderBook(pair)
      .then((orderBook) => {
        dispatch({ type: 'SET_ORDER_BOOK', orderBook });
      })
      .catch((err: Error) => {
        dispatch({ type: 'SET_ERROR', error: `Failed to load order book: ${err.message}` });
        dispatch({ type: 'SET_LOADING_ORDER_BOOK', loading: false });
      });
  }, [state.selectedPair]);

  useEffect(() => {
    if (isConnected) {
      subscribe(state.selectedPair, 'all');
      prevPairRef.current = state.selectedPair;
    }
  }, [state.selectedPair, isConnected, subscribe]);

  const setPair = useCallback((pair: CryptoPair) => {
    dispatch({ type: 'SET_PAIR', pair });
  }, []);

  const setStream = useCallback((stream: StreamType) => {
    dispatch({ type: 'SET_STREAM', stream });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null });
  }, []);

  const value = useMemo(
    () => ({ state, setPair, setStream, clearError }),
    [state, setPair, setStream, clearError],
  );

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
}

export function useCrypto(): CryptoContextValue {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}
