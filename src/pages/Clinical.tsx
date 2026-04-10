import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, Clipboard, TestTube, Pill, FileText, ChevronRight, Search, Filter, Activity } from 'lucide-react';

const CLINICAL_TASKS = [
  { id: 1, title: 'Morning Rounds Assessment', time: '08:30 AM', status: 'Completed', doctor: 'Dr. Dhoni' },
  { id: 2, title: 'Blood Gas Analysis', time: '10:15 AM', status: 'Pending', doctor: 'Lab' },
  { id: 3, title: 'Feeding Protocol Update', time: '12:00 PM', status: 'Scheduled', doctor: 'Nurse Priya' },
  { id: 4, title: 'Neurological Screening', time: '02:30 PM', status: 'Scheduled', doctor: 'Dr. Ananya Sharma' },
];

const PROTOCOLS = [
  { 
    title: "Respiratory Support", 
    description: "Non-invasive ventilation monitoring with NeoVision AI.",
    status: "Active",
    lastUpdated: "2h ago",
    icon: Stethoscope,
    color: "text-accent-cyan"
  },
  { 
    title: "Nutritional Support", 
    description: "Enteral feeding schedule: 45ml every 3 hours.",
    status: "Active",
    lastUpdated: "4h ago",
    icon: Pill,
    color: "text-accent-yellow"
  },
  { 
    title: "Infection Control", 
    description: "Standard NICU precautions. Prophylactic monitoring.",
    status: "Monitoring",
    lastUpdated: "12h ago",
    icon: TestTube,
    color: "text-amber-400"
  },
  { 
    title: "Neuro-Protection", 
    description: "Minimal handling protocol. Quiet environment maintained.",
    status: "Active",
    lastUpdated: "1h ago",
    icon: Activity,
    color: "text-indigo-400"
  }
];

export const ClinicalPage = () => {
  const [labRequested, setLabRequested] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRequestLab = () => {
    setLabRequested(true);
    setTimeout(() => setLabRequested(false), 3000); // Reset after 3s
  };

  const filteredProtocols = PROTOCOLS.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = CLINICAL_TASKS.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = taskStatusFilter === 'All' || t.status === taskStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-text-primary tracking-tight mb-2">Clinical Management</h2>
          <p className="text-text-secondary text-base">Diagnostic tools, treatment protocols, and daily clinical workflows.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search protocols & tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-theme-border/50 border border-theme-border rounded-full text-sm focus:outline-none focus:border-cyan-500/50 transition-colors w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Protocols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-glass rounded-5xl p-8">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-accent-cyan" />
              Active Treatment Protocols
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProtocols.map((protocol, index) => (
                <ProtocolCard 
                  key={index}
                  {...protocol}
                />
              ))}
              {filteredProtocols.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-secondary border border-dashed border-theme-border rounded-4xl">
                  No protocols matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          <div className="card-glass rounded-5xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Daily Clinical Tasks</h3>
              <div className="flex items-center gap-3">
                <div className="relative" ref={filterRef}>
                  <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={cn(
                      "p-2 rounded-full transition-all duration-300",
                      taskStatusFilter !== 'All' ? "bg-cyan-500 text-black" : "bg-theme-card-hover text-text-secondary hover:bg-slate-700"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-3 w-40 bg-theme-card border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-2 space-y-1">
                        {['All', 'Completed', 'Pending', 'Scheduled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setTaskStatusFilter(status);
                              setShowFilterDropdown(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-colors",
                              taskStatusFilter === status ? "bg-accent-cyan/10 text-accent-cyan" : "text-text-secondary hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {status === 'All' ? 'All Tasks' : status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setTaskStatusFilter('All');
                    setSearchQuery('');
                  }}
                  className="text-sm font-bold text-accent-cyan hover:text-cyan-300 transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-3xl border border-theme-border hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      task.status === 'Completed' ? "bg-accent-yellow/20 text-accent-yellow" : "bg-theme-card-hover text-text-secondary"
                    )}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-text-primary">{task.title}</p>
                      <p className="text-[12px] text-text-secondary">{task.time} • Assigned to {task.doctor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                      task.status === 'Completed' ? "bg-accent-yellow/10 text-accent-yellow" : 
                      task.status === 'Pending' ? "bg-orange-500/10 text-orange-400" : "bg-theme-card-hover text-text-secondary"
                    )}>
                      {task.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="py-12 text-center text-text-secondary border border-dashed border-theme-border rounded-3xl">
                  No tasks matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Summary */}
        <div className="space-y-6">
          <div className="card-glass rounded-5xl p-8 bg-linear-to-br from-cyan-500/5 to-transparent border-cyan-500/10">
            <h3 className="font-bold text-xl mb-6">Diagnostic Summary</h3>
            <div className="space-y-6">
              <DiagnosticItem label="Blood pH" value="7.38" status="Normal" />
              <DiagnosticItem label="pCO2" value="42 mmHg" status="Normal" />
              <DiagnosticItem label="pO2" value="68 mmHg" status="Low Normal" />
              <DiagnosticItem label="Bicarbonate" value="24 mEq/L" status="Normal" />
              <DiagnosticItem label="Lactate" value="1.2 mmol/L" status="Normal" />
            </div>
            <button 
              onClick={handleRequestLab}
              className={cn(
                "w-full mt-8 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
                labRequested 
                  ? "bg-accent-yellow/20 text-accent-yellow border border-emerald-500/20" 
                  : "bg-cyan-500 text-black hover:bg-cyan-400"
              )}
            >
              {labRequested ? 'Request mail sent' : 'Request New Lab Work'}
            </button>
          </div>

          <div className="card-glass rounded-5xl p-8">
            <h3 className="font-bold text-xl mb-4">Clinical Team</h3>
            <div className="space-y-4">
              <TeamMember name="Dr. Dhoni" role="Lead Neonatologist" status="On Duty" />
              <TeamMember name="Dr. Ananya Sharma" role="Neurologist" status="On Call" />
              <TeamMember name="Nurse Priya" role="Senior NICU Nurse" status="On Duty" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtocolCard = ({ title, description, status, lastUpdated, icon: Icon, color }: any) => (
  <div className="p-5 bg-slate-800/30 rounded-4xl border border-theme-border hover:border-cyan-500/30 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 bg-theme-card-hover rounded-2xl group-hover:scale-110 transition-transform", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">{lastUpdated}</span>
    </div>
    <h4 className="text-base font-bold text-text-primary mb-2">{title}</h4>
    <p className="text-[12px] text-text-secondary leading-relaxed mb-4">{description}</p>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[12px] font-bold text-accent-yellow uppercase tracking-widest">{status}</span>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, status }: any) => (
  <div className="flex justify-between items-center">
    <div>
      <p className="text-[12px] font-bold text-text-secondary uppercase tracking-widest mb-1">{label}</p>
      <p className="text-base font-bold text-text-primary">{value}</p>
    </div>
    <span className={cn(
      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
      status === 'Normal' ? "bg-accent-yellow/10 text-accent-yellow" : "bg-orange-500/10 text-orange-400"
    )}>
      {status}
    </span>
  </div>
);

const TeamMember = ({ name, role, status }: any) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-theme-card-hover flex items-center justify-center text-sm font-bold text-text-secondary">
      {name.split(' ').map((n: string) => n[0]).join('')}
    </div>
    <div>
      <p className="text-sm font-bold text-text-primary">{name}</p>
      <p className="text-[12px] text-text-secondary">{role}</p>
    </div>
    <div className={cn(
      "ml-auto w-2 h-2 rounded-full",
      status === 'On Duty' ? "bg-emerald-400" : "bg-orange-400"
    )} />
  </div>
);

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
