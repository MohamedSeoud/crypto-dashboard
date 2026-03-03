import { useEffect, useRef } from 'react';
import {
  type CandlestickData,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type Time,
  createChart,
} from 'lightweight-charts';
import type { Candle } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface CandleChartProps {
  candles: Candle[];
  isLoading: boolean;
  pair: string;
}

function toChartData(candle: Candle): CandlestickData<Time> {
  return {
    time: (candle.timestamp / 1000) as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  };
}

export function CandleChart({ candles, isLoading, pair }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const prevCandleLengthRef = useRef(0);

  // Create chart on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#4b5563', width: 1, style: 3 },
        horzLine: { color: '#4b5563', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: '#374151',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#16c784',
      downColor: '#ea3943',
      borderDownColor: '#ea3943',
      borderUpColor: '#16c784',
      wickDownColor: '#ea3943',
      wickUpColor: '#16c784',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Responsive resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update data when candles change
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const isAppend = candles.length > prevCandleLengthRef.current && prevCandleLengthRef.current > 0;

    if (isAppend) {
      // Only update the last candle (real-time update)
      const lastCandle = candles[candles.length - 1];
      seriesRef.current.update(toChartData(lastCandle));
    } else {
      // Full data reset (new pair selected)
      const chartData = candles.map(toChartData);
      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
    }

    prevCandleLengthRef.current = candles.length;
  }, [candles]);

  // Reset length tracking when pair changes
  useEffect(() => {
    prevCandleLengthRef.current = 0;
  }, [pair]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-800 bg-gray-900/50">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-200">
          Candle Chart
          <span className="ml-2 text-xs font-normal text-gray-500">{pair}</span>
        </h2>
        {candles.length > 0 && (
          <span className="text-xs text-gray-500">
            {candles.length} candles
          </span>
        )}
      </div>
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80">
            <LoadingSpinner label="Loading chart data..." />
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" style={{ minHeight: 300 }} />
      </div>
    </div>
  );
}
