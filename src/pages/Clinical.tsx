import React from 'react';
import { Stethoscope, Clipboard, TestTube, Pill, FileText, ChevronRight, Search, Filter } from 'lucide-react';

const CLINICAL_TASKS = [
  { id: 1, title: 'Morning Rounds Assessment', time: '08:30 AM', status: 'Completed', doctor: 'Dr. Fred' },
  { id: 2, title: 'Blood Gas Analysis', time: '10:15 AM', status: 'Pending', doctor: 'Lab' },
  { id: 3, title: 'Feeding Protocol Update', time: '12:00 PM', status: 'Scheduled', doctor: 'Nurse Priya' },
  { id: 4, title: 'Neurological Screening', time: '02:30 PM', status: 'Scheduled', doctor: 'Dr. Chen' },
];

export const ClinicalPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Clinical Management</h2>
          <p className="text-slate-500 text-sm">Diagnostic tools, treatment protocols, and daily clinical workflows.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search protocols..." 
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-white/5 rounded-full text-xs focus:outline-none focus:border-cyan-500/50 transition-colors w-64"
            />
          </div>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Protocols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-glass rounded-5xl p-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-cyan-400" />
              Active Treatment Protocols
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProtocolCard 
                title="Respiratory Support" 
                description="Non-invasive ventilation monitoring with NeoVision AI."
                status="Active"
                lastUpdated="2h ago"
                icon={Stethoscope}
                color="text-cyan-400"
              />
              <ProtocolCard 
                title="Nutritional Support" 
                description="Enteral feeding schedule: 45ml every 3 hours."
                status="Active"
                lastUpdated="4h ago"
                icon={Pill}
                color="text-emerald-400"
              />
              <ProtocolCard 
                title="Infection Control" 
                description="Standard NICU precautions. Prophylactic monitoring."
                status="Monitoring"
                lastUpdated="12h ago"
                icon={TestTube}
                color="text-amber-400"
              />
              <ProtocolCard 
                title="Neuro-Protection" 
                description="Minimal handling protocol. Quiet environment maintained."
                status="Active"
                lastUpdated="1h ago"
                icon={Activity}
                color="text-indigo-400"
              />
            </div>
          </div>

          <div className="card-glass rounded-5xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Daily Clinical Tasks</h3>
              <button className="text-xs font-bold text-cyan-400">View All</button>
            </div>
            <div className="space-y-3">
              {CLINICAL_TASKS.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      task.status === 'Completed' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                    )}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{task.title}</p>
                      <p className="text-[10px] text-slate-500">{task.time} • Assigned to {task.doctor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                      task.status === 'Completed' ? "bg-emerald-500/10 text-emerald-400" : 
                      task.status === 'Pending' ? "bg-orange-500/10 text-orange-400" : "bg-slate-800 text-slate-500"
                    )}>
                      {task.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Summary */}
        <div className="space-y-6">
          <div className="card-glass rounded-5xl p-8 bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-500/10">
            <h3 className="font-bold text-lg mb-6">Diagnostic Summary</h3>
            <div className="space-y-6">
              <DiagnosticItem label="Blood pH" value="7.38" status="Normal" />
              <DiagnosticItem label="pCO2" value="42 mmHg" status="Normal" />
              <DiagnosticItem label="pO2" value="68 mmHg" status="Low Normal" />
              <DiagnosticItem label="Bicarbonate" value="24 mEq/L" status="Normal" />
              <DiagnosticItem label="Lactate" value="1.2 mmol/L" status="Normal" />
            </div>
            <button className="w-full mt-8 py-3 bg-cyan-500 text-black rounded-2xl text-xs font-bold hover:bg-cyan-400 transition-colors">
              Request New Lab Work
            </button>
          </div>

          <div className="card-glass rounded-5xl p-8">
            <h3 className="font-bold text-lg mb-4">Clinical Team</h3>
            <div className="space-y-4">
              <TeamMember name="Dr. Fredrickson" role="Lead Neonatologist" status="On Duty" />
              <TeamMember name="Dr. Elena Chen" role="Neurologist" status="On Call" />
              <TeamMember name="Sarah Jenkins" role="Senior NICU Nurse" status="On Duty" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtocolCard = ({ title, description, status, lastUpdated, icon: Icon, color }: any) => (
  <div className="p-5 bg-slate-800/30 rounded-4xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lastUpdated}</span>
    </div>
    <h4 className="text-sm font-bold text-white mb-2">{title}</h4>
    <p className="text-[10px] text-slate-500 leading-relaxed mb-4">{description}</p>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{status}</span>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, status }: any) => (
  <div className="flex justify-between items-center">
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
    <span className={cn(
      "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
      status === 'Normal' ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
    )}>
      {status}
    </span>
  </div>
);

const TeamMember = ({ name, role, status }: any) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
      {name.split(' ').map((n: string) => n[0]).join('')}
    </div>
    <div>
      <p className="text-xs font-bold text-white">{name}</p>
      <p className="text-[10px] text-slate-500">{role}</p>
    </div>
    <div className={cn(
      "ml-auto w-2 h-2 rounded-full",
      status === 'On Duty' ? "bg-emerald-400" : "bg-orange-400"
    )} />
  </div>
);

const Activity = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
