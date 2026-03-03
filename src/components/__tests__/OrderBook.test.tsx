import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderBook } from '../OrderBook';
import type { OrderBook as OrderBookType } from '../../types';

const mockOrderBook: OrderBookType = {
  bids: [
    { price: 45000.0, quantity: 1.5 },
    { price: 44999.5, quantity: 0.8 },
    { price: 44998.0, quantity: 2.1 },
  ],
  asks: [
    { price: 45001.0, quantity: 1.2 },
    { price: 45002.5, quantity: 0.5 },
    { price: 45003.0, quantity: 3.0 },
  ],
};

describe('OrderBook', () => {
  it('renders loading spinner when isLoading is true', () => {
    render(<OrderBook orderBook={null} isLoading={true} pair="BTC-USDT" />);
    expect(screen.getByText('Loading order book...')).toBeInTheDocument();
  });

  it('renders "no data" message when order book is null and not loading', () => {
    render(<OrderBook orderBook={null} isLoading={false} pair="BTC-USDT" />);
    expect(screen.getByText('No order book data available')).toBeInTheDocument();
  });

  it('renders order book title with pair name', () => {
    render(<OrderBook orderBook={mockOrderBook} isLoading={false} pair="ETH-USDT" />);
    expect(screen.getByText('ETH-USDT')).toBeInTheDocument();
    expect(screen.getByText('Order Book')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<OrderBook orderBook={mockOrderBook} isLoading={false} pair="BTC-USDT" />);
    expect(screen.getByText('Price (USDT)')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders bid and ask prices', () => {
    render(<OrderBook orderBook={mockOrderBook} isLoading={false} pair="BTC-USDT" />);
    expect(screen.getByText('45,000.00')).toBeInTheDocument();
    expect(screen.getByText('45,001.00')).toBeInTheDocument();
  });

  it('calculates and displays mid-price correctly', () => {
    render(<OrderBook orderBook={mockOrderBook} isLoading={false} pair="BTC-USDT" />);
    expect(screen.getByText('45,000.50')).toBeInTheDocument();
  });

  it('displays spread information', () => {
    render(<OrderBook orderBook={mockOrderBook} isLoading={false} pair="BTC-USDT" />);
    expect(screen.getByText(/Spread/)).toBeInTheDocument();
  });
});
