import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts';
import type { IChartApi, CandlestickData, HistogramData, LineData } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface ChartProps {
  data: any[];
  height?: number;
}

const TradingViewChart = ({ data, height = 500 }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8b949e',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: '#161b22' },
        horzLines: { color: '#161b22' },
      },
      crosshair: {
        mode: 0,
        vertLine: { labelBackgroundColor: '#ef4444' },
        horzLine: { labelBackgroundColor: '#ef4444' },
      },
      rightPriceScale: {
        borderColor: '#30363d',
      },
      timeScale: {
        borderColor: '#30363d',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
      height,
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderVisible: false,
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    });

    const candleData: CandlestickData[] = data.map((d) => ({
      time: d.time || d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.price,
    }));
    candleSeries.setData(candleData);

    // 2. Volume Series (Overlay)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // Separate scale
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    const volumeData: HistogramData[] = data.map((d) => ({
      time: d.time || d.date,
      value: d.volume,
      color: d.price >= d.open ? '#ef444433' : '#3b82f633',
    }));
    volumeSeries.setData(volumeData);

    // 3. RSI Series (Separate Pane)
    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#10b981',
      lineWidth: 2,
      priceScaleId: 'rsi',
    });
    rsiSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.1, bottom: 0.85 },
      visible: false,
    });
    const rsiData: LineData[] = data
      .filter((d) => d.rsi !== undefined)
      .map((d) => ({
        time: d.time || d.date,
        value: d.rsi,
      }));
    rsiSeries.setData(rsiData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, height]);

  return <div ref={chartContainerRef} className="w-full" />;
};

export default TradingViewChart;
