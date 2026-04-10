import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Camera, 
  Settings, 
  Info, 
  Play, 
  Square, 
  ShieldAlert,
  Presentation,
  Baby,
  Stethoscope,
  Bell,
  Home,
  Heart,
  Thermometer,
  Droplets,
  User,
  LayoutGrid,
  Bookmark,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BreathingGraph } from './components/BreathingGraph';
import { AlertLog, type Alert } from './components/AlertLog';
import { SlideDeck } from './components/SlideDeck';
import { cn } from './lib/utils';
import { HealthPage } from './pages/Health';
import { ClinicalPage } from './pages/Clinical';
import { WidgetsPage } from './pages/Widgets';
import { RecordsPage } from './pages/Records';

const WEEKLY_STABILITY_DATA = [
  { day: 'Sun', value: 82, color: 'bg-cyan-400/40' },
  { day: 'Mon', value: 78, color: 'bg-cyan-400/40' },
  { day: 'Tue', value: 45, color: 'bg-orange-400/40' },
  { day: 'Wed', value: 88, color: 'bg-emerald-400/40' },
  { day: 'Thu', value: 92, color: 'bg-emerald-400/40' },
  { day: 'Fri', value: 85, color: 'bg-cyan-400/40' },
  { day: 'Sat', value: 89, color: 'bg-cyan-400/40' },
];

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [respiratoryRate, setRespiratoryRate] = useState(42);

  const [temp, setTemp] = useState(36.8);
  const [apneaTimer, setApneaTimer] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showSlides, setShowSlides] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulate RR and other vitals
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Respiratory Rate Simulation
      setRespiratoryRate(prev => {
        let next;
        const rand = Math.random();
        
        if (rand < 0.05) { // 5% chance of apnea event
          next = 0;
        } else if (rand < 0.15) { // 10% chance of tachypnea spike
          next = Math.floor(Math.random() * 20) + 65;
        } else { // Normal range fluctuation
          const change = Math.floor(Math.random() * 7) - 3;
          next = Math.max(30, Math.min(60, prev === 0 ? 40 : prev + change));
        }
        
        // Alert logic
        if (next > 60) {
          addAlert('Tachypnea', `High respiratory rate: ${next} BPM`, 'high');
        } else if (next === 0) {
          addAlert('Warning', 'Respiratory movement stopped. Monitoring...', 'medium');
        }
        
        return next;
      });


    }, 4000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Apnea Timer Logic
  useEffect(() => {
    if (!isMonitoring) {
      setApneaTimer(0);
      return;
    }

    let interval: NodeJS.Timeout;
    if (respiratoryRate === 0) {
      interval = setInterval(() => {
        setApneaTimer(prev => {
          const next = prev + 1;
          if (next === 20) {
            addAlert('Apnea', 'CRITICAL: No movement for 20s!', 'high');
          }
          return next;
        });
      }, 1000);
    } else {
      setApneaTimer(0);
    }

    return () => clearInterval(interval);
  }, [isMonitoring, respiratoryRate]);

  const addAlert = (type: Alert['type'], message: string, severity: Alert['severity']) => {
    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      severity,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 20));
  };

  const startCamera = async () => {
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsCameraReady(true);
      setIsSimulated(false);
      setIsMonitoring(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);

      addAlert('Normal', 'Clinical camera feed initialized.', 'low');
    } catch (err) {
      console.error("Error accessing camera:", err);
      addAlert('Warning', 'Hardware camera not found. Entering Simulation Mode.', 'medium');
      startSimulation();
    }
  };

  const startSimulation = () => {
    setIsCameraReady(true);
    setIsSimulated(true);
    setIsMonitoring(true);
    addAlert('Normal', 'Simulation mode active.', 'low');
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
    setIsSimulated(false);
    setIsMonitoring(false);
    setRespiratoryRate(42);
    addAlert('Warning', 'Monitoring session ended.', 'medium');
  };

  const NavItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(label)}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 font-medium text-sm",
        activeTab === label 
          ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30" 
          : "text-slate-500 hover:text-slate-300"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, unit, color, trend }: any) => (
    <div className="card-glass p-6 rounded-5xl flex flex-col justify-between h-full group hover:bg-[#161a20] transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{trend}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <h4 className="text-3xl font-bold text-white tracking-tight">{value}</h4>
          <span className="text-xs font-medium text-slate-500">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-200 font-sans p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Top Header/Nav */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Baby className="text-black w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">NeoVision</h1>
            </div>
            
            <nav className="hidden xl:flex items-center gap-2 bg-[#111418] p-1.5 rounded-full border border-white/5">
              <NavItem icon={Home} label="Home" />
              <NavItem icon={Activity} label="Health" />
              <NavItem icon={Stethoscope} label="Clinical" />
              <NavItem icon={LayoutGrid} label="Widgets" />
              <NavItem icon={Bookmark} label="Records" />
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-3 text-right hover:bg-white/5 active:scale-95 p-2 rounded-full transition-all cursor-pointer">
              <div>
                <p className="text-sm font-bold text-white">Hello, Dr. Dhoni</p>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Neonatologist</p>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                <img src="https://i.pravatar.cc/150?u=dhoni" alt="User" className="w-full h-full object-cover" />
              </div>
            </button>
            <button className="relative p-3 bg-[#111418] rounded-full border border-white/5 hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#111418]" />
            </button>
          </div>
        </header>

        {/* Dashboard Title & Quick Stats */}
        <div className="flex items-end justify-between">
          <h2 className="text-4xl font-bold tracking-tight text-white">{activeTab === 'Home' ? 'Dashboard' : activeTab}</h2>
          <div className="flex gap-4">
            <div className="bg-[#d9f99d] text-black px-6 py-2.5 rounded-full flex items-center gap-3 font-bold text-sm">
              <Activity className="w-4 h-4" />
              System: {isMonitoring ? "Active" : "Standby"}
            </div>
            <div className="bg-[#111418] text-white px-6 py-2.5 rounded-full flex items-center gap-3 font-bold text-sm border border-white/5">
              <Plus className="w-4 h-4" />
              04 April
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Small Stats & Alerts */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="shrink-0">
                  <StatCard 
                    icon={Activity} 
                    label="Respiratory Rate" 
                    value={respiratoryRate} 
                    unit="BPM" 
                    color="bg-orange-500" 
                    trend="Stable" 
                  />
                </div>
                
                <div className="card-glass rounded-5xl p-6 flex-1 flex flex-col h-full overflow-hidden">
                  <AlertLog alerts={alerts} />
                </div>
              </div>

              {/* Center Column: Main Graph & Video */}
              <div className="lg:col-span-6 space-y-6 flex flex-col">
                {/* Main Graph Card */}
                <div className="card-glass rounded-5xl p-8 min-h-[650px] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <button className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="font-bold text-sm">Real-time Waveform Analysis</span>
                      <button className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-cyan-400/20 text-cyan-400 px-4 py-1 rounded-full text-[10px] font-bold">+65%</div>
                      <div className="bg-slate-800 text-slate-400 px-4 py-1 rounded-full text-[10px] font-bold">LIVE</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-slate-800/30 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Inspiration Time</p>
                      <p className="text-lg font-mono text-cyan-400">0.42s</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Expiration Time</p>
                      <p className="text-lg font-mono text-cyan-400">0.85s</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">I:E Ratio</p>
                      <p className="text-lg font-mono text-cyan-400">1:2.0</p>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[180px]">
                    <BreathingGraph isActive={isMonitoring} />
                  </div>
                  
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">7-Day Stability Trend</p>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Avg: 85.2%</p>
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                      {WEEKLY_STABILITY_DATA.map((item) => (
                        <div key={item.day} className="flex flex-col items-center gap-2">
                          <div className="w-full h-20 bg-slate-800/30 rounded-full relative overflow-hidden group">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${item.value}%` }}
                              className={cn("absolute bottom-0 left-0 right-0 transition-colors", item.color)} 
                            />
                            {/* Tooltip on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 flex items-center justify-center transition-opacity">
                              <span className="text-[10px] font-bold text-white">{item.value}%</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Feed Section */}
                <div className="grid grid-cols-1 gap-6 mt-auto">
                  <div className="card-glass rounded-5xl p-6 min-h-[320px] relative overflow-hidden group">
                    <div className="absolute top-6 right-6 z-10 flex gap-3">
                      {!isCameraReady ? (
                        <button onClick={startCamera} className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-full font-bold text-xs transition-colors flex items-center gap-2 shadow-lg">
                          <Camera className="w-4 h-4" /> Start Camera
                        </button>
                      ) : (
                        <button onClick={stopCamera} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xs transition-colors flex items-center gap-2 shadow-lg">
                          <Square className="w-4 h-4 fill-current" /> Stop Camera
                        </button>
                      )}
                    </div>
                    
                    {!isCameraReady ? (
                      <div className="flex flex-col items-center justify-center h-full text-center pt-8">
                        <Camera className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-sm font-bold text-slate-500">Camera is currently inactive</p>
                      </div>
                    ) : (
                      <>
                        {isSimulated ? (
                          <img src="https://images.unsplash.com/photo-1555252333-9f8e92e65ee9?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover rounded-4xl" referrerPolicy="no-referrer" />
                        ) : (
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-4xl" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111418]/80 to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-6 pointer-events-none">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Live Monitor</p>
                          <h4 className="text-lg font-bold text-white">Newborn Unit 04</h4>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Clinical Notes & Score */}
              <div className="lg:col-span-3 space-y-6">
                <div className="card-glass rounded-5xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-sm">Clinical Notes</h3>
                    <button className="text-cyan-400 text-xs font-bold">Today</button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start p-4 bg-slate-800/30 rounded-3xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white mb-1">Morning Assessment</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Respiratory rhythm stable. No signs of distress observed during sleep cycle.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-slate-800/30 rounded-3xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                        <Droplets className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white mb-1">Fluid Intake</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Feeding schedule maintained. Hydration levels optimal.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-glass rounded-5xl p-8 flex flex-col items-center text-center">
                  <div className="flex justify-between w-full mb-6">
                    <div className="p-3 bg-cyan-400/20 rounded-2xl">
                      <LayoutGrid className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"><ChevronLeft className="w-3 h-3" /></button>
                      <button className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"><ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Wellness Score</p>
                  <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#1e293b" strokeWidth="12" />
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#22d3ee" strokeWidth="12" strokeDasharray="502" strokeDashoffset={502 * (1 - 0.85)} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <h4 className="text-4xl font-black text-white">8.5<span className="text-xl text-slate-500">/10</span></h4>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Excellent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl w-full mb-6">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src="https://i.pravatar.cc/150?u=nurse" alt="Nurse" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-white">Nurse Priya S.</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest">Primary Caregiver</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowSlides(true)} 
                    className="w-full py-4 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl flex flex-col items-center gap-3 group hover:bg-cyan-500/20 transition-all duration-300"
                  >
                    <div className="p-3 bg-cyan-400/20 rounded-2xl group-hover:scale-110 transition-transform">
                      <Presentation className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-1">Clinical Strategy</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest">View 10-Slide Deck</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'Health' ? (
            <HealthPage />
          ) : activeTab === 'Clinical' ? (
            <ClinicalPage />
          ) : activeTab === 'Widgets' ? (
            <WidgetsPage />
          ) : (
            <RecordsPage />
          )}
        </AnimatePresence>
      </div>

      <SlideDeck isOpen={showSlides} onClose={() => setShowSlides(false)} />
    </div>
  );
}

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
);
