import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createSeriesMarkers,
} from 'lightweight-charts';
import type { IChartApi, CandlestickData, HistogramData, LineData, SeriesMarker } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  data: any[];
  type?: 'candlestick' | 'area';
  markers?: SeriesMarker<any>[];
  height?: number;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, type = 'candlestick', markers = [], height = 400 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8b949e',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        borderColor: '#30363d',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#30363d',
      },
      crosshair: {
        mode: 0,
      },
    });
    
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderVisible: false,
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay by setting a blank priceScaleId
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // highest point of the volume series will be 80% down from the top
        bottom: 0,
      },
    });

    const smaSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      lineStyle: 2, // Dashed
      title: 'SMA 20',
    });

    const bbUpperSeries = chart.addSeries(LineSeries, {
      color: '#30363d',
      lineWidth: 1,
      lineStyle: 1, // Dotted
    });

    const bbLowerSeries = chart.addSeries(LineSeries, {
      color: '#30363d',
      lineWidth: 1,
      lineStyle: 1, // Dotted
    });

    // Data Transformation
    const candleData: CandlestickData[] = data.map(d => ({
      time: d.time || d.date,
      open: d.open || d.price,
      high: d.high || d.price,
      low: d.low || d.price,
      close: d.price,
    }));

    const volData: HistogramData[] = data.map(d => ({
      time: d.time || d.date,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
    }));

    const smaData: LineData[] = data
      .filter(d => d.sma20)
      .map(d => ({ time: d.time || d.date, value: d.sma20 }));

    const upperData: LineData[] = data
      .filter(d => d.bbUpper)
      .map(d => ({ time: d.time || d.date, value: d.bbUpper }));

    const lowerData: LineData[] = data
      .filter(d => d.bbLower)
      .map(d => ({ time: d.time || d.date, value: d.bbLower }));

    candlestickSeries.setData(candleData);
    volumeSeries.setData(volData);
    smaSeries.setData(smaData);
    bbUpperSeries.setData(upperData);
    bbLowerSeries.setData(lowerData);

    // Apply markers
    if (markers.length > 0) {
      createSeriesMarkers(candlestickSeries, markers);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, markers, height]);

  return <div ref={chartContainerRef} className="w-full" />;
};

export default TradingViewChart;
