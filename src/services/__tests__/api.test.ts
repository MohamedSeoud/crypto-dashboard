import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCandles, fetchOrderBook } from '../api';

const mockCandles = [
  { timestamp: 1691404800000, open: 45000, high: 45500, low: 44800, close: 45200, volume: 123 },
  { timestamp: 1691404860000, open: 45200, high: 45600, low: 45100, close: 45400, volume: 456 },
];

const mockOrderBook = {
  bids: [{ price: 45000, quantity: 1.5 }],
  asks: [{ price: 45001, quantity: 1.2 }],
};

describe('API Service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchCandles', () => {
    it('fetches candle data for a given pair', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCandles,
      } as Response);

      const result = await fetchCandles('BTC-USDT');
      expect(fetch).toHaveBeenCalledWith('/api/candles/BTC-USDT');
      expect(result).toEqual(mockCandles);
    });

    it('throws ApiError on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(fetchCandles('INVALID-PAIR' as never)).rejects.toThrow('Failed to fetch');
    });
  });

  describe('fetchOrderBook', () => {
    it('fetches order book data for a given pair', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrderBook,
      } as Response);

      const result = await fetchOrderBook('ETH-USDT');
      expect(fetch).toHaveBeenCalledWith('/api/orderbook/ETH-USDT');
      expect(result).toEqual(mockOrderBook);
    });

    it('throws ApiError on network failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(fetchOrderBook('BTC-USDT')).rejects.toThrow('Internal Server Error');
    });
  });
});
