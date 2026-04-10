import React, { useEffect, useState, useCallback } from 'react';
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

export const BreathingGraph = ({ isActive }: { isActive: boolean }) => {
  const [data, setData] = useState<{ time: number; value: number; ecg: number; label: string }[]>([]);
  const [tick, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setTick((t) => t + 0.15);
      setData((prev) => {
        // Breathing Wave (Sinusoidal)
        const breathingValue = Math.sin(tick) * 0.3 + 0.4 + (Math.random() * 0.02);
        
        // ECG Wave Simulation (P-QRS-T)
        const ecgTick = tick * 5; // Faster frequency for heart rate
        const phase = ecgTick % (Math.PI * 2);
        let ecgValue = 0.3; // Baseline
        
        if (phase > 0 && phase < 0.4) {
          // P Wave
          ecgValue += Math.sin((phase / 0.4) * Math.PI) * 0.05;
        } else if (phase >= 0.5 && phase < 0.6) {
          // Q
          ecgValue -= (phase - 0.5) * 2;
        } else if (phase >= 0.6 && phase < 0.7) {
          // R Spike
          ecgValue += (phase - 0.6) * 8;
        } else if (phase >= 0.7 && phase < 0.8) {
          // S
          ecgValue -= (phase - 0.7) * 4;
        } else if (phase >= 1.0 && phase < 1.5) {
          // T Wave
          ecgValue += Math.sin(((phase - 1.0) / 0.5) * Math.PI) * 0.1;
        }
        
        ecgValue += (Math.random() * 0.01); // Subtle noise

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newData = [...prev, { 
          time: now.getTime(), 
          value: breathingValue, 
          ecg: ecgValue,
          label: timeStr 
        }];
        return newData.slice(-200);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, isPaused, tick]);

  const resetGraph = useCallback(() => {
    setData([]);
    setTick(0);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 bg-theme-card-hover hover:bg-theme-border rounded-lg text-accent-cyan transition-colors flex items-center gap-2 text-sm font-bold"
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            {isPaused ? "RESUME FEED" : "PAUSE TO INSPECT"}
          </button>
          <button 
            onClick={resetGraph}
            className="p-2 bg-theme-card-hover hover:bg-theme-border rounded-lg text-text-secondary transition-colors"
            title="Reset Graph"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
        {isPaused && (
          <span className="text-[12px] font-bold text-accent-yellow animate-pulse uppercase tracking-widest">
            Inspection Mode Active
          </span>
        )}
      </div>

      <div className="h-64 w-full bg-theme-card rounded-3xl p-4 border border-theme-border relative group">
        <div className="absolute top-4 right-4 flex gap-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-cyan" />
            <span className="text-[12px] font-bold text-text-secondary uppercase">Respiration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-yellow" />
            <span className="text-[12px] font-bold text-text-secondary uppercase">ECG (Sim)</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e1ff" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#00e1ff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f8cd51" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f8cd51" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" hide />
            <YAxis hide domain={[0, 1.5]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0d3446', border: '1px solid #17536d', borderRadius: '12px' }}
              itemStyle={{ color: '#ffffff' }}
              labelStyle={{ color: '#7fa8b8', fontSize: '10px' }}
            />
            {/* Breathing Wave */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00e1ff"
              strokeWidth={3}
              fill="url(#colorCyan)"
              dot={false}
              isAnimationActive={false}
            />
            {/* ECG Wave */}
            <Area
              type="monotone"
              dataKey="ecg"
              stroke="#f8cd51"
              strokeWidth={2}
              fill="url(#colorYellow)"
              dot={false}
              isAnimationActive={false}
            />
            <Brush 
              dataKey="label" 
              height={30} 
              stroke="#17536d" 
              fill="#061a29"
              travellerWidth={10}
              gap={1}
            >
              <LineChart>
                <Line type="monotone" dataKey="value" stroke="#00e1ff" strokeWidth={1} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="ecg" stroke="#f8cd51" strokeWidth={1} dot={false} isAnimationActive={false} />
              </LineChart>
            </Brush>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[12px] text-text-secondary text-center uppercase tracking-[0.2em]">
        Use the slider above to zoom and pan through respiratory history
      </p>
    </div>
  );
};
