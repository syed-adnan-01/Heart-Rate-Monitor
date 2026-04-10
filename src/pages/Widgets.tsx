import React from 'react';
import { LayoutGrid, Plus, Settings, Eye, EyeOff, Move, Trash2, Info } from 'lucide-react';

const WIDGETS = [
  { id: 1, title: 'Real-time Waveform', description: 'Live respiratory and ECG visualization.', active: true, size: 'Large' },
  { id: 2, title: 'Alert Log', description: 'System alerts and clinical notifications.', active: true, size: 'Medium' },
  { id: 3, title: 'Vitals Summary', description: 'Quick view of RR and Temp.', active: true, size: 'Small' },
  { id: 4, title: 'Clinical Strategy', description: 'Access to treatment protocols and decks.', active: true, size: 'Medium' },
  { id: 5, title: 'Weekly Stability', description: '7-day trend analysis of patient stability.', active: false, size: 'Medium' },
  { id: 6, title: 'Developmental Milestones', description: 'Progress tracking for growth and feeding.', active: false, size: 'Small' },
  { id: 7, title: 'Team Directory', status: 'Beta', description: 'Quick contact for the clinical care team.', active: false, size: 'Small' },
  { id: 8, title: 'Environmental Monitor', status: 'New', description: 'Ambient light and noise level tracking.', active: false, size: 'Small' },
];

export const WidgetsPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Dashboard Widgets</h2>
          <p className="text-slate-500 text-sm">Customize your monitoring workspace with modular clinical widgets.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 text-black rounded-full text-xs font-bold transition-all hover:bg-cyan-400 active:scale-95">
          <Plus className="w-4 h-4" />
          ADD NEW WIDGET
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {WIDGETS.map((widget) => (
          <div key={widget.id} className={cn(
            "card-glass p-6 rounded-5xl flex flex-col group transition-all duration-300",
            widget.active ? "border-cyan-500/20 bg-cyan-500/5" : "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
          )}>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-transform">
                <LayoutGrid className={cn("w-5 h-5", widget.active ? "text-cyan-400" : "text-slate-500")} />
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                  {widget.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-bold text-white">{widget.title}</h4>
                {widget.status && (
                  <span className="text-[8px] font-black px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded uppercase tracking-widest">
                    {widget.status}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-6">{widget.description}</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Size:</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{widget.size}</span>
              </div>
              <div className="flex gap-3">
                <button className="p-1.5 text-slate-600 hover:text-white transition-colors"><Move className="w-4 h-4" /></button>
                <button className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-glass rounded-5xl p-8 bg-slate-900/50 border-dashed border-slate-700">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Info className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Custom Widget API</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-8">
            NeoVision AI supports custom clinical widgets via our developer SDK. Integrate your own diagnostic tools or data visualizations directly into the dashboard.
          </p>
          <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-colors">
            Read SDK Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
