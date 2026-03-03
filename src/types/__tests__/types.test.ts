import { describe, expect, it } from 'vitest';
import { CRYPTO_PAIRS, STREAM_LABELS, STREAM_TYPES } from '../index';

describe('Type Constants', () => {
  describe('CRYPTO_PAIRS', () => {
    it('contains the three expected pairs', () => {
      expect(CRYPTO_PAIRS).toEqual(['BTC-USDT', 'ETH-USDT', 'XRP-USDT']);
    });

    it('has exactly 3 pairs', () => {
      expect(CRYPTO_PAIRS).toHaveLength(3);
    });
  });

  describe('STREAM_TYPES', () => {
    it('contains all, candles, and orderbook', () => {
      expect(STREAM_TYPES).toEqual(['all', 'candles', 'orderbook']);
    });
  });

  describe('STREAM_LABELS', () => {
    it('maps each stream type to a human-readable label', () => {
      expect(STREAM_LABELS.all).toBe('All (Candles & Order Book)');
      expect(STREAM_LABELS.candles).toBe('Candles Only');
      expect(STREAM_LABELS.orderbook).toBe('Order Book Only');
    });
  });
});
