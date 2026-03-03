import { CryptoProvider, useCrypto } from './context/CryptoContext';
import { Header } from './components/Header';
import { CandleChart } from './components/CandleChart';
import { OrderBook } from './components/OrderBook';
import { ErrorBanner } from './components/ErrorBanner';

function Dashboard() {
  const { state, clearError } = useCrypto();
  const {
    selectedPair,
    selectedStream,
    currentCandles,
    currentOrderBook,
    isLoadingCandles,
    isLoadingOrderBook,
    error,
  } = state;

  const showCandles = selectedStream === 'all' || selectedStream === 'candles';
  const showOrderBook = selectedStream === 'all' || selectedStream === 'orderbook';
  const isSinglePanel = !showCandles || !showOrderBook;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-4 p-4">
        {error && (
          <ErrorBanner message={error} onDismiss={clearError} />
        )}

        <div
          className={`grid flex-1 gap-4 ${
            isSinglePanel
              ? 'grid-cols-1'
              : 'grid-cols-1 lg:grid-cols-[1fr_380px]'
          }`}
          style={{ minHeight: 'calc(100vh - 140px)' }}
        >
          {showCandles && (
            <CandleChart
              candles={currentCandles}
              isLoading={isLoadingCandles}
              pair={selectedPair}
            />
          )}

          {showOrderBook && (
            <OrderBook
              orderBook={currentOrderBook}
              isLoading={isLoadingOrderBook}
              pair={selectedPair}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CryptoProvider>
      <Dashboard />
    </CryptoProvider>
  );
}
