import React from 'react';
import { Activity, Heart, Droplets, Thermometer, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const HEALTH_HISTORY = [
  { time: '00:00', hr: 125, rr: 42, spo2: 98 },
  { time: '04:00', hr: 132, rr: 45, spo2: 97 },
  { time: '08:00', hr: 128, rr: 40, spo2: 99 },
  { time: '12:00', hr: 145, rr: 55, spo2: 96 },
  { time: '16:00', hr: 138, rr: 48, spo2: 98 },
  { time: '20:00', hr: 130, rr: 44, spo2: 98 },
  { time: '23:59', hr: 124, rr: 42, spo2: 99 },
];

export const HealthPage = () => {
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-text-primary tracking-tight mb-2">Patient Health Summary</h2>
          <p className="text-text-secondary text-base">Comprehensive vitals analysis and physiological trends for Unit 04.</p>
        </div>
        <div className="flex gap-3 no-print">
          <button 
            onClick={handleExportPDF} 
            className="px-6 py-2 bg-theme-card-hover hover:bg-slate-700 rounded-full text-sm font-bold transition-colors"
          >
            Export PDF
          </button>
          <button className="px-6 py-2 bg-cyan-500 text-black rounded-full text-sm font-bold transition-colors">Update Assessment</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthMetricCard 
          icon={Heart} 
          label="Avg Heart Rate" 
          value="132" 
          unit="BPM" 
          trend="+2.4%" 
          isPositive={false}
          color="text-accent-yellow"
        />
        <HealthMetricCard 
          icon={Activity} 
          label="Avg Resp Rate" 
          value="44" 
          unit="BPM" 
          trend="-1.2%" 
          isPositive={true}
          color="text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-glass rounded-5xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl">24-Hour Physiological Trends</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-cyan" />
                <span className="text-[12px] font-bold text-text-secondary uppercase">Heart Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-yellow" />
                <span className="text-[12px] font-bold text-text-secondary uppercase">Resp Rate</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={HEALTH_HISTORY}>
                <defs>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e1ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00e1ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f8cd51" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f8cd51" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#17536d" vertical={false} />
                <XAxis dataKey="time" stroke="#7fa8b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#7fa8b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d3446', border: '1px solid #17536d', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="hr" stroke="#00e1ff" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" />
                <Area type="monotone" dataKey="rr" stroke="#f8cd51" strokeWidth={3} fillOpacity={1} fill="url(#colorRr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glass rounded-5xl p-8">
          <h3 className="font-bold text-xl mb-6">Developmental Milestones</h3>
          <div className="space-y-6">
            <MilestoneItem 
              label="Weight Gain" 
              value="1.85kg" 
              target="2.0kg" 
              progress={85} 
              color="bg-cyan-400"
            />
            <MilestoneItem 
              label="Feeding Tolerance" 
              value="45ml" 
              target="60ml" 
              progress={75} 
              color="bg-emerald-400"
            />
            <MilestoneItem 
              label="Sleep Cycles" 
              value="14h" 
              target="18h" 
              progress={65} 
              color="bg-amber-400"
            />
            <MilestoneItem 
              label="Skin Integrity" 
              value="Optimal" 
              target="Optimal" 
              progress={100} 
              color="bg-indigo-400"
            />
          </div>
          <div className="mt-8 p-4 bg-slate-800/30 rounded-3xl border border-theme-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-4 h-4 text-accent-yellow" />
              <p className="text-sm font-bold text-text-primary">Clinical Outlook</p>
            </div>
            <p className="text-[12px] text-text-secondary leading-relaxed">
              Patient is showing consistent improvement in respiratory stability. Predicted discharge window: 4-6 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HealthMetricCard = ({ icon: Icon, label, value, unit, trend, isPositive, color }: any) => (
  <div className="card-glass p-6 rounded-5xl group hover:bg-[#161a20] transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-theme-border/50 rounded-2xl group-hover:scale-110 transition-transform">
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-[12px] font-bold",
        trend === "Stable" ? "bg-theme-card-hover text-text-secondary" : 
        isPositive ? "bg-accent-yellow/10 text-accent-yellow" : "bg-red-500/10 text-red-400"
      )}>
        {trend !== "Stable" && (isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
        {trend}
      </div>
    </div>
    <p className="text-sm font-semibold text-text-secondary mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <h4 className="text-4xl font-bold text-text-primary tracking-tight">{value}</h4>
      <span className="text-sm font-medium text-text-secondary">{unit}</span>
    </div>
  </div>
);

const MilestoneItem = ({ label, value, target, progress, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <p className="text-sm font-bold text-text-primary">{label}</p>
      <p className="text-[12px] text-text-secondary font-mono">{value} / {target}</p>
    </div>
    <div className="h-1.5 w-full bg-theme-card-hover rounded-full overflow-hidden">
      <div 
        className={cn("h-full transition-all duration-1000", color)} 
        style={{ width: `${progress}%` }} 
      />
    </div>
  </div>
);

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
