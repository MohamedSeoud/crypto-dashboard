import { useMemo } from 'react';
import type { OrderBook as OrderBookType, OrderBookEntry } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface OrderBookProps {
  orderBook: OrderBookType | null;
  isLoading: boolean;
  pair: string;
}

interface OrderRowProps {
  entry: OrderBookEntry & { total: number };
  maxTotal: number;
  side: 'bid' | 'ask';
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function OrderRow({ entry, maxTotal, side }: OrderRowProps) {
  const depthPercent = maxTotal > 0 ? (entry.total / maxTotal) * 100 : 0;

  return (
    <div className="relative flex items-center px-3 py-1 text-xs font-mono">
      <div
        className={side === 'bid' ? 'depth-bar-bid' : 'depth-bar-ask'}
        style={{ width: `${depthPercent}%` }}
      />
      <span className={`relative z-10 w-1/3 text-right ${side === 'bid' ? 'text-bid' : 'text-ask'}`}>
        {formatPrice(entry.price)}
      </span>
      <span className="relative z-10 w-1/3 text-right text-gray-300">
        {formatAmount(entry.quantity)}
      </span>
      <span className="relative z-10 w-1/3 text-right text-gray-400">
        {formatAmount(entry.total)}
      </span>
    </div>
  );
}

function computeTotals(entries: OrderBookEntry[]): (OrderBookEntry & { total: number })[] {
  let running = 0;
  return entries.map((e) => {
    running += e.quantity;
    return { ...e, total: running };
  });
}

export function OrderBook({ orderBook, isLoading, pair }: OrderBookProps) {
  const { asks, bids, maxAskTotal, maxBidTotal, midPrice, spread, spreadPercent } = useMemo(() => {
    if (!orderBook) {
      return { asks: [], bids: [], maxAskTotal: 0, maxBidTotal: 0, midPrice: 0, spread: 0, spreadPercent: '0.00' };
    }

    const asksWithTotal = computeTotals(orderBook.asks);
    const bidsWithTotal = computeTotals(orderBook.bids);

    const maxAsk = asksWithTotal.length > 0 ? asksWithTotal[asksWithTotal.length - 1].total : 0;
    const maxBid = bidsWithTotal.length > 0 ? bidsWithTotal[bidsWithTotal.length - 1].total : 0;

    const bestBid = orderBook.bids[0]?.price ?? 0;
    const bestAsk = orderBook.asks[0]?.price ?? 0;
    const mid = bestBid > 0 && bestAsk > 0 ? (bestBid + bestAsk) / 2 : 0;
    const sp = bestAsk - bestBid;
    const spPercent = mid > 0 ? ((sp / mid) * 100).toFixed(3) : '0.000';

    return {
      asks: asksWithTotal.slice().reverse(), // Show highest ask at top
      bids: bidsWithTotal,
      maxAskTotal: maxAsk,
      maxBidTotal: maxBid,
      midPrice: mid,
      spread: sp,
      spreadPercent: spPercent,
    };
  }, [orderBook]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-800 bg-gray-900/50">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-200">
          Order Book
          <span className="ml-2 text-xs font-normal text-gray-500">{pair}</span>
        </h2>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner label="Loading order book..." />
        </div>
      ) : !orderBook ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          No order book data available
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            <span className="w-1/3 text-right">Price (USDT)</span>
            <span className="w-1/3 text-right">Amount</span>
            <span className="w-1/3 text-right">Total</span>
          </div>

          {/* Asks (sell orders) - reversed so lowest ask is closest to mid-price */}
          <div className="flex-1 overflow-y-auto">
            {asks.map((entry, i) => (
              <OrderRow key={`ask-${i}`} entry={entry} maxTotal={maxAskTotal} side="ask" />
            ))}
          </div>

          {/* Mid-price */}
          <div className="flex items-center justify-center gap-3 border-y border-gray-700 bg-gray-800/50 px-3 py-2">
            <span className="text-lg font-bold text-white">
              {formatPrice(midPrice)}
            </span>
            <span className="text-[10px] text-gray-400">
              Spread: {formatPrice(spread)} ({spreadPercent}%)
            </span>
          </div>

          {/* Bids (buy orders) */}
          <div className="flex-1 overflow-y-auto">
            {bids.map((entry, i) => (
              <OrderRow key={`bid-${i}`} entry={entry} maxTotal={maxBidTotal} side="bid" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
