import React from 'react';
import { AlertCircle, Clock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Alert {
  id: string;
  type: 'Tachypnea' | 'Apnea' | 'Normal' | 'Warning';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export const AlertLog = ({ alerts }: { alerts: Alert[] }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <h3 className="text-slate-200 font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Live Alert Log
        </h3>
        <span className="text-sm text-slate-500 font-mono">REAL-TIME</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-3 rounded-xl border flex gap-3 ${
                alert.severity === 'high' 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                  : alert.severity === 'medium'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold uppercase tracking-wider">{alert.type}</span>
                  <span className="text-[12px] opacity-60 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-base leading-tight">{alert.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {alerts.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-600 text-base italic">
            Monitoring active...
          </div>
        )}
      </div>
    </div>
  );
};
