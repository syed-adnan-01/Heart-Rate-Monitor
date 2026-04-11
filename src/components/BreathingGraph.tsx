import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  XAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  LineChart,
  Line
} from 'recharts';
import { Pause, Play, RotateCcw } from 'lucide-react';

export const BreathingGraph = ({ isActive, respiratoryRate = 40 }: { isActive: boolean, respiratoryRate?: number }) => {
  const [data, setData] = useState<{ time: number; value: number; label: string }[]>([]);
  const [tick, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [feedKey, setFeedKey] = useState(Date.now());
  const imgRef = useRef<HTMLImageElement>(null);

  // Force reconnect to the signal feed whenever monitoring starts
  useEffect(() => {
    if (isActive) {
      setFeedKey(Date.now());
    }
  }, [isActive]);

  // Auto-retry on image load failure (Python not ready yet)
  const handleImgError = useCallback(() => {
    const timer = setTimeout(() => {
      setFeedKey(Date.now());
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setTick((t) => t + 0.15);
      setData((prev) => {
        const freqScale = Math.max(0.1, respiratoryRate / 40); // Base target is 40 BPM 
        const breathingValue = Math.sin(tick * freqScale) * 0.3 + 0.4 + (Math.random() * 0.02);

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newData = [...prev, {
          time: now.getTime(),
          value: breathingValue,
          label: timeStr
        }];
        return newData.slice(-200);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, isPaused, tick, respiratoryRate]);

  const resetGraph = useCallback(() => {
    setData([]);
    setTick(0);
  }, []);

  return (
    <div className="flex flex-col gap-4">


      <div className="h-64 w-full bg-theme-card rounded-3xl p-4 border border-theme-border relative group">
        <div className="absolute top-4 right-4 flex gap-4 z-10">
          <div className="flex items-center gap-2 bg-theme-border/50 px-3 py-1.5 rounded-xl border border-white/5">
            <div className="w-3 h-3 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-[12px] font-bold text-text-secondary uppercase">Live Feed</span>
            <span className="text-lg font-black text-accent-cyan ml-2">{respiratoryRate} BPM</span>
          </div>
        </div>
        <img
          ref={imgRef}
          key={feedKey}
          src={`http://localhost:5001/signal_feed?t=${feedKey}`}
          className="w-full h-full object-cover rounded-xl bg-[#061a29]"
          alt="Waiting for Python Live Signal..."
          onError={handleImgError}
        />
      </div>
      <p className="text-[12px] text-text-secondary text-center uppercase tracking-[0.2em]">
        Use the slider above to zoom and pan through respiratory history
      </p>
    </div>
  );
};
