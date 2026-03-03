import { useCrypto } from '../context/CryptoContext';
import { CRYPTO_PAIRS, STREAM_LABELS, STREAM_TYPES } from '../types';
import type { CryptoPair, StreamType } from '../types';
import { ConnectionStatus } from './ConnectionStatus';

export function Header() {
  const { state, setPair, setStream } = useCrypto();

  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Crypto Dashboard</h1>
            <ConnectionStatus status={state.connectionStatus} />
          </div>
        </div>

        {/* Selectors */}
        <div className="flex items-center gap-3">
          {/* Pair selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="pair-select" className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Pair
            </label>
            <select
              id="pair-select"
              value={state.selectedPair}
              onChange={(e) => setPair(e.target.value as CryptoPair)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CRYPTO_PAIRS.map((pair) => (
                <option key={pair} value={pair}>
                  {pair}
                </option>
              ))}
            </select>
          </div>

          {/* Stream selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="stream-select" className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Stream
            </label>
            <select
              id="stream-select"
              value={state.selectedStream}
              onChange={(e) => setStream(e.target.value as StreamType)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {STREAM_TYPES.map((stream) => (
                <option key={stream} value={stream}>
                  {STREAM_LABELS[stream]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
