import React, { useEffect, useState, useCallback } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  YAxis, 
  XAxis,
  CartesianGrid, 
  Brush,
  Tooltip
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
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-cyan-400 transition-colors flex items-center gap-2 text-xs font-bold"
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            {isPaused ? "RESUME FEED" : "PAUSE TO INSPECT"}
          </button>
          <button 
            onClick={resetGraph}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
            title="Reset Graph"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
        {isPaused && (
          <span className="text-[10px] font-bold text-amber-500 animate-pulse uppercase tracking-widest">
            Inspection Mode Active
          </span>
        )}
      </div>

      <div className="h-64 w-full bg-slate-900/50 rounded-3xl p-4 border border-slate-800 relative group">
        <div className="absolute top-4 right-4 flex gap-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Respiration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">ECG (Sim)</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" hide />
            <YAxis hide domain={[0, 1.5]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              itemStyle={{ color: '#22d3ee' }}
              labelStyle={{ color: '#64748b', fontSize: '10px' }}
            />
            {/* Breathing Wave */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              opacity={0.8}
            />
            {/* ECG Wave */}
            <Line
              type="monotone"
              dataKey="ecg"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              opacity={0.9}
            />
            <Brush 
              dataKey="label" 
              height={30} 
              stroke="#1e293b" 
              fill="#0f172a"
              travellerWidth={10}
              gap={1}
            >
              <LineChart>
                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={1} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="ecg" stroke="#34d399" strokeWidth={1} dot={false} isAnimationActive={false} />
              </LineChart>
            </Brush>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-500 text-center uppercase tracking-[0.2em]">
        Use the slider above to zoom and pan through respiratory history
      </p>
    </div>
  );
};
