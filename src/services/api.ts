import type { Candle, CryptoPair, OrderBook } from '../types';

const API_BASE = '/api';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch ${url}: ${response.statusText}`,
      response.status,
    );
  }
  return response.json() as Promise<T>;
}

export async function fetchCandles(pair: CryptoPair): Promise<Candle[]> {
  return fetchJson<Candle[]>(`${API_BASE}/candles/${pair}`);
}

export async function fetchOrderBook(pair: CryptoPair): Promise<OrderBook> {
  return fetchJson<OrderBook>(`${API_BASE}/orderbook/${pair}`);
}
