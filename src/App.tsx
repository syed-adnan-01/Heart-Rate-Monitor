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
  Plus,
  Calendar,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BreathingGraph } from './components/BreathingGraph';
import { AlertLog, type Alert } from './components/AlertLog';
import { SlideDeck } from './components/SlideDeck';
import { cn } from './lib/utils';
import { HealthPage } from './pages/Health';
import { ClinicalPage } from './pages/Clinical';
import { RecordsPage } from './pages/Records';
import { io } from 'socket.io-client';

export interface PatientRecord {
  id: number | string;
  title: string;
  date: string;
  type: 'Report' | 'Note' | 'Data' | 'Lab' | 'Imaging' | 'Protocol';
  doctor: string;
  size: string;
  content: string;
  status: 'New' | 'Read' | 'Unread';
}

const INITIAL_PATIENT_RECORDS: PatientRecord[] = [
  { 
    id: 1, 
    title: 'Admission Summary', 
    date: '2026-03-28', 
    type: 'Report', 
    doctor: 'Dr. Dhoni', 
    size: '1.2 MB', 
    content: '# Admission Summary\n\n**Patient:** Unit 04\n**Date:** 2026-03-28\n\nPatient admitted for observation. Initial vitals stable. No immediate signs of respiratory distress. Monitored for continuous SpO2 and Heart Rate.',
    status: 'Read'
  },
  { 
    id: 2, 
    title: 'Daily Clinical Note - Apr 10', 
    date: '2026-04-10', 
    type: 'Note', 
    doctor: 'Nurse Priya', 
    size: '450 KB', 
    content: '# Clinical Note - April 10 (Today)\n\nPatient had a stable morning. Feeding protocol followed. No apneic events observed. Temperature stable at 36.8°C. Increased activity noted during nursing care.',
    status: 'New'
  },
  { 
    id: 3, 
    title: 'Respiratory Trend Analysis', 
    date: '2026-04-10', 
    type: 'Data', 
    doctor: 'NeoVision AI', 
    size: '2.8 MB', 
    content: '# AI Respiratory Trend Analysis\n\nReal-time assessment of respiratory patterns. Patient shows nominal rhythm. Slight tachypnea during feeding earlier today, quickly resolving to baseline of 42 BPM.',
    status: 'Unread'
  },
  { 
    id: 4, 
    title: 'Blood Gas Results', 
    date: '2026-04-10', 
    type: 'Lab', 
    doctor: 'Lab Services', 
    size: '850 KB', 
    content: '# Blood Gas Lab Results (Latest)\n\npH: 7.38\nPaCO2: 38 mmHg\nPaO2: 92 mmHg\nHCO3: 24 mEq/L\n\nInterpretation: Perfectly normal neonatal acid-base balance.',
    status: 'New'
  },
  { 
    id: 5, 
    title: 'Neurological Assessment', 
    date: '2026-03-30', 
    type: 'Report', 
    doctor: 'Dr. Aditya Verma', 
    size: '1.5 MB', 
    content: '# Neurological Assessment\n\nAlert and responsive. Normal reflexes and tone for gestational age. Pupils equal and reactive.',
    status: 'Read'
  },
  { 
    id: 6, 
    title: 'Feeding Protocol - Phase 2', 
    date: '2026-04-09', 
    type: 'Protocol', 
    doctor: 'Dr. Dhoni', 
    size: '320 KB', 
    content: '# Feeding Protocol Update\n\nMove to Phase 2 enteral feeding: 25ml every 3 hours. Monitor tolerance, check residuals. Hold if residuals > 40%.',
    status: 'Read'
  },
  { 
    id: 7, 
    title: 'Chest X-Ray - Follow-up', 
    date: '2026-04-05', 
    type: 'Imaging', 
    doctor: 'Radiology', 
    size: '12.4 MB', 
    content: '# Imaging: Chest X-Ray\n\nClear lung fields bilaterally. Cardiac silhouette normal. No pleural effusion. Significant improvement since admission.',
    status: 'Read'
  },
  { 
    id: 8, 
    title: 'Complete Blood Count', 
    date: '2026-04-08', 
    type: 'Lab', 
    doctor: 'Lab Services', 
    size: '600 KB', 
    content: '# Lab: Complete Blood Count\n\nWBC: 9.2 x10^3/uL\nRBC: 4.5 x10^6/uL\nHgb: 15.2 g/dL\nPlt: 280 x10^3/uL\n\nAll parameters within reference neonatal limits.',
    status: 'Read'
  },
  { 
    id: 9, 
    title: 'Night Shift Observation', 
    date: '2026-04-09', 
    type: 'Note', 
    doctor: 'Nurse Priya', 
    size: '310 KB', 
    content: '# Night Shift Observation\n\nQuiet night. Sleep cycle undisturbed. Respiratory rate ranged from 38-44 BPM.',
    status: 'Read'
  },
  { 
    id: 10, 
    title: 'Echocardiogram Report', 
    date: '2026-03-31', 
    type: 'Report', 
    doctor: 'Dr. Rajesh Iyer', 
    size: '4.2 MB', 
    content: '# Echocardiogram Report\n\nNormal biventricular function. No evidence of PDA or septal defects. Ejection fraction estimated at 65%.',
    status: 'Read'
  },
  { 
    id: 11, 
    title: 'Heart Rate Variability', 
    date: '2026-04-08', 
    type: 'Data', 
    doctor: 'NeoVision AI', 
    size: '1.8 MB', 
    content: '# AI Data: Heart Rate Variability\n\nHRV analysis indicates robust autonomic regulation for gestational age.',
    status: 'Read'
  },
  { 
    id: 12, 
    title: 'Daily Clinical Note - Apr 09', 
    date: '2026-04-09', 
    type: 'Note', 
    doctor: 'Nurse Priya', 
    size: '420 KB', 
    content: '# Clinical Note - April 9\n\nStable growth progress. Weight up 20g today. Respiratory support minimal.',
    status: 'Read'
  },
];

const WEEKLY_STABILITY_DATA = [
  { day: 'Sun', value: 82, color: 'bg-accent-cyan/40' },
  { day: 'Mon', value: 78, color: 'bg-accent-cyan/40' },
  { day: 'Tue', value: 45, color: 'bg-accent-yellow/80' },
  { day: 'Wed', value: 88, color: 'bg-accent-cyan/40' },
  { day: 'Tha', value: 92, color: 'bg-accent-cyan/40' },
  { day: 'Fri', value: 85, color: 'bg-accent-cyan/40' },
  { day: 'Sad', value: 89, color: 'bg-accent-cyan/40' },
];

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [respiratoryRate, setRespiratoryRate] = useState(42);
  const [heartRate, setHeartRate] = useState(124);
  const [spo2, setSpo2] = useState(98);
  const [temp, setTemp] = useState(36.8);
  const [apneaTimer, setApneaTimer] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showSlides, setShowSlides] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<PatientRecord[]>(INITIAL_PATIENT_RECORDS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDoctorInfo, setShowDoctorInfo] = useState(false);
  const [showNurseInfo, setShowNurseInfo] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const audioContext = useRef<AudioContext | null>(null);
  const activeOscillator = useRef<OscillatorNode | null>(null);
  const activeGainNode = useRef<GainNode | null>(null);
  const activeLFO = useRef<OscillatorNode | null>(null);
  const isManuallySilenced = useRef(false);

  const stopAlarm = () => {
    isManuallySilenced.current = true;
    if (activeOscillator.current) {
      try {
        activeOscillator.current.stop();
        activeOscillator.current.disconnect();
      } catch (e) {}
      activeOscillator.current = null;
    }
    if (activeLFO.current) {
      try {
        activeLFO.current.stop();
        activeLFO.current.disconnect();
      } catch (e) {}
      activeLFO.current = null;
    }
    if (activeGainNode.current) {
      activeGainNode.current.disconnect();
      activeGainNode.current = null;
    }
    setIsAlarmActive(false);
  };

  const playBuzzer = (isContinuous = false) => {
    if (!isSoundEnabled) return;

    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContext.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (isContinuous && (activeOscillator.current || isManuallySilenced.current)) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(660, ctx.currentTime);

      if (isContinuous) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(220, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        
        activeOscillator.current = oscillator;
        activeLFO.current = lfo;
        activeGainNode.current = gainNode;
        setIsAlarmActive(true);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        lfo.start();
        oscillator.start();
      } else {
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const markRecordAsRead = (id: string | number) => {
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, status: 'Read' } : record
    ));
  };
  const dateInputRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const doctorInfoRef = useRef<HTMLDivElement>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Socket.IO
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to NeoVision Backend');
    });

    socket.on('vitals_update', (data: { respiratoryRate: number; status: string; timestamp: string }) => {
      if (!isMonitoring) return;
      
      setRespiratoryRate(data.respiratoryRate);
      
      if (data.status === 'CRITICAL') {
        addAlert('Warning', `Critical Respiratory Rate: ${data.respiratoryRate} BPM`, 'high');
      } else if (data.status === 'NORMAL') {
        isManuallySilenced.current = false;
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isMonitoring]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setHeartRate(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        let next = prev + change;
        if (next < 110) next = 120;
        if (next > 170) next = 160;
        return next;
      });

      setSpo2(prev => {
        const rand = Math.random();
        let next;
        if (rand < 0.05) {
          next = Math.floor(Math.random() * 5) + 85;
          addAlert('Warning', `Low SpO2 detected: ${next}%`, 'medium');
        } else {
          const change = Math.floor(Math.random() * 3) - 1;
          next = Math.max(94, Math.min(100, prev + change));
          if (next >= 95) {
            isManuallySilenced.current = false;
          }
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (doctorInfoRef.current && !doctorInfoRef.current.contains(event.target as Node)) {
        setShowDoctorInfo(false);
      }
    };
    if (showNotifications || showDoctorInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showDoctorInfo]);

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

    if (severity === 'high') {
      playBuzzer(true);
    } else if (severity === 'medium') {
      playBuzzer(false);
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      addAlert('Warning', 'Camera API not supported in this browser/context (Check HTTPS).', 'high');
      startSimulation();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });

      streamRef.current = stream;
      setIsCameraReady(true);
      setIsSimulated(false);
      setIsMonitoring(true);
      addAlert('Normal', 'Live camera feed connected successfully.', 'low');
    } catch (err: any) {
      console.error("Camera Error Details:", err);
      addAlert('Warning', `Camera Error: ${err.name || 'Unknown'}. Entering Simulation.`, 'medium');
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

  const videoPortalRef = (el: HTMLVideoElement | null) => {
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
    }
  };

  const NavItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(label)}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-base",
        activeTab === label ? "pill-active-cyan" : "pill-inactive"
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
          <Icon className="w-5 h-5 text-text-primary" />
        </div>
        <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">{trend}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-text-secondary mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <h4 className="text-4xl font-bold text-text-primary tracking-tight">{value}</h4>
          <span className="text-sm font-medium text-text-secondary">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-theme-bg text-text-primary font-sans p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Top Header/Nav */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Baby className="text-black w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">NeoVision</h1>
            </div>
            
            <nav className="hidden xl:flex items-center gap-2 bg-theme-card p-1.5 rounded-full border border-theme-border">
              <NavItem icon={Home} label="Home" />
              <NavItem icon={Activity} label="Health" />
              <NavItem icon={Stethoscope} label="Clinical" />
              <NavItem icon={Bookmark} label="Records" />
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative" ref={doctorInfoRef}>
              <button 
                onClick={() => setShowDoctorInfo(!showDoctorInfo)}
                className={cn(
                  "flex items-center gap-3 text-right hover:bg-white/5 active:scale-95 p-2 rounded-full transition-all cursor-pointer",
                  showDoctorInfo && "bg-white/10"
                )}
              >
                <div>
                  <p className="text-base font-bold text-text-primary">Hello, Dr. Dhoni</p>
                  <p className="text-[12px] text-text-secondary font-mono uppercase tracking-widest">Neonatologist</p>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                  <img src="/doc_avatar.png" alt="User" className="w-full h-full object-cover" />
                </div>
              </button>

              <AnimatePresence>
                {showDoctorInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-[320px] z-50 overflow-hidden"
                  >
                    <div className="card-glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                      <div className="p-6 bg-linear-to-b from-white/5 to-transparent">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent-cyan/30">
                            <img src="/doc_avatar.png" alt="Dr. Dhoni" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-text-primary">Dr. Dhoni</h3>
                            <p className="text-sm text-accent-cyan font-medium">Senior Neonatologist</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-3 bg-white/5 rounded-2xl border border-theme-border">
                            <p className="text-[12px] font-bold text-text-secondary uppercase tracking-widest mb-1">Department</p>
                            <p className="text-base text-text-primary">Neonatal ICU (NICU)</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl border border-theme-border">
                            <p className="text-[12px] font-bold text-text-secondary uppercase tracking-widest mb-1">Experience</p>
                            <p className="text-base text-text-primary">15+ Years specialized care</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl border border-theme-border">
                            <p className="text-[12px] font-bold text-text-secondary uppercase tracking-widest mb-1">Clinic Hours</p>
                            <p className="text-base text-text-primary">09:00 AM - 05:00 PM</p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-2">
                          <button className="w-full py-3 bg-cyan-500 text-black rounded-2xl font-bold text-sm hover:bg-cyan-400 transition-colors">
                            Edit Profile
                          </button>
                          <button className="w-full py-3 bg-white/5 text-text-secondary rounded-2xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all">
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4">
              {isAlarmActive && (
                <button 
                  onClick={stopAlarm}
                  className="bg-accent-yellow text-slate-900 px-6 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all animate-pulse"
                >
                  SILENCE ALARM
                </button>
              )}

              <button 
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className={cn(
                  "p-3 rounded-full border transition-all duration-300",
                  isSoundEnabled 
                    ? "bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan" 
                    : "bg-theme-card border-theme-border text-text-secondary hover:bg-slate-800"
                )}
                title={isSoundEnabled ? "Mute Buzzer" : "Unmute Buzzer"}
              >
                {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={cn(
                    "relative p-3 rounded-full border transition-all duration-300",
                    showNotifications 
                      ? "bg-accent-cyan/20 border-cyan-500/50 text-accent-cyan" 
                      : "bg-theme-card border-theme-border text-text-secondary hover:bg-slate-800"
                  )}
                >
                  <Bell className="w-5 h-5" />
                  {alerts.length > 0 && (
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-yellow rounded-full border-2 border-[#111418]" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-[380px] z-50 overflow-hidden"
                    >
                      <div className="card-glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-theme-border flex items-center justify-between bg-white/5">
                          <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                            <Bell className="w-4 h-4 text-accent-cyan" />
                            Notifications
                          </h3>
                          <span className="text-[12px] font-mono text-text-secondary uppercase">Latest System Alerts</span>
                        </div>
                        
                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-2">
                          {alerts.length === 0 ? (
                            <div className="py-12 text-center text-text-secondary flex flex-col items-center gap-2">
                              <ShieldAlert className="w-8 h-8 opacity-20" />
                              <p className="text-base font-medium">No new notifications</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {alerts.map((alert) => (
                                <button 
                                  key={alert.id}
                                  className="w-full text-left p-4 rounded-2xl hover:bg-white/5 transition-colors group flex items-start gap-4"
                                >
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                    alert.severity === 'high' ? "bg-red-500/10 text-accent-cyan" :
                                    alert.severity === 'medium' ? "bg-orange-500/10 text-accent-yellow" :
                                    "bg-accent-cyan/10 text-accent-cyan"
                                  )}>
                                    <Activity className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">{alert.type}</span>
                                      <span className="text-[12px] text-text-secondary">{alert.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-text-primary leading-snug truncate">{alert.message}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 bg-white/5 text-center border-t border-theme-border">
                          <button 
                            onClick={() => setAlerts([])}
                            className="text-[12px] font-bold text-accent-cyan hover:text-cyan-300 transition-colors uppercase tracking-[0.2em]"
                          >
                            Clear All Activity
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-4">
          <h2 className="text-5xl font-bold tracking-tight text-text-primary">{activeTab === 'Home' ? 'Dashboard' : activeTab}</h2>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="bg-[#d9f99d] text-black px-5 sm:px-6 py-2.5 rounded-full flex items-center gap-2 sm:gap-3 font-bold text-base whitespace-nowrap">
              <Activity className="w-4 h-4" />
              System: {isMonitoring ? "Active" : "Standby"}
            </div>
            <div 
              onClick={() => dateInputRef.current?.showPicker()}
              className="relative bg-theme-card text-text-primary rounded-full flex items-center gap-3 px-5 sm:px-6 py-2.5 font-bold text-base border border-theme-border hover:border-cyan-500/30 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <Calendar className="w-4 h-4 text-accent-cyan group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-text-secondary uppercase tracking-widest hidden lg:block">Change Date:</span>
                <span className="text-text-primary">
                  {new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}
                </span>
              </div>
              <input 
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                title="Click to change date"
              />
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
                    color="bg-accent-yellow" 
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
                      <button className="p-2 bg-theme-card-hover rounded-full hover:bg-slate-700 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="font-bold text-base">Real-time Waveform Analysis</span>
                      <button className="p-2 bg-theme-card-hover rounded-full hover:bg-slate-700 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-cyan-400/20 text-accent-cyan px-4 py-1 rounded-full text-[12px] font-bold">+65%</div>
                      <div className={cn(
                        "px-4 py-1 rounded-full text-[12px] font-bold transition-all duration-300",
                        isCameraReady 
                          ? "bg-red-500/20 text-accent-cyan border border-red-500/30 animate-pulse" 
                          : "bg-theme-card-hover text-text-secondary"
                      )}>
                        LIVE
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-slate-800/30 rounded-2xl border border-theme-border hover:border-cyan-500/30 transition-colors">
                      <p className="text-[12px] font-bold text-text-secondary uppercase mb-1">Inspiration Time</p>
                      <p className="text-xl font-mono text-accent-cyan">0.42s</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-2xl border border-theme-border hover:border-cyan-500/30 transition-colors">
                      <p className="text-[12px] font-bold text-text-secondary uppercase mb-1">Expiration Time</p>
                      <p className="text-xl font-mono text-accent-cyan">0.85s</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-2xl border border-theme-border hover:border-cyan-500/30 transition-colors">
                      <p className="text-[12px] font-bold text-text-secondary uppercase mb-1">I:E Ratio</p>
                      <p className="text-xl font-mono text-accent-cyan">1:2.0</p>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[180px]">
                    <BreathingGraph isActive={isMonitoring} respiratoryRate={respiratoryRate} />
                  </div>
                  
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">7-Day Stability Trend</p>
                      <p className="text-[12px] font-bold text-accent-yellow uppercase tracking-widest">Avg: 85.2%</p>
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
                              <span className="text-[12px] font-bold text-text-primary">{item.value}%</span>
                            </div>
                          </div>
                          <span className="text-[12px] font-bold text-text-secondary uppercase">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Feed Section */}
                <div className="grid grid-cols-1 gap-6 mt-auto">
                  <div className="card-glass rounded-5xl p-6 min-h-[500px] relative overflow-hidden group">
                    <div className="absolute top-6 right-6 z-10 flex gap-3">
                      {!isCameraReady ? (
                        <button onClick={startCamera} className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-lg">
                          <Camera className="w-4 h-4" /> Start Camera
                        </button>
                      ) : (
                        <button onClick={stopCamera} className="bg-accent-cyan hover:bg-red-600 text-text-primary px-4 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-lg">
                          <Square className="w-4 h-4 fill-current" /> Stop Camera
                        </button>
                      )}
                    </div>
                    
                    {!isCameraReady ? (
                      <div className="flex flex-col items-center justify-center h-full text-center pt-8">
                        <Camera className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-base font-bold text-text-secondary">Camera is currently inactive</p>
                      </div>
                    ) : (
                      <>
                        {isSimulated ? (
                          <img src="https://images.unsplash.com/photo-1555252333-9f8e92e65ee9?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover rounded-4xl" referrerPolicy="no-referrer" />
                        ) : (
                          <video ref={videoPortalRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-4xl" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-[#111418]/80 to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-6 pointer-events-none">
                          <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-1">Live Monitor</p>
                          <h4 className="text-xl font-bold text-text-primary">Newborn Unit 04</h4>
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
                    <h3 className="font-bold text-base">Clinical Notes</h3>
                    <button className="text-accent-cyan text-sm font-bold">Today</button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start p-4 bg-slate-800/30 rounded-3xl border border-theme-border">
                      <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-accent-cyan" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary mb-1">Morning Assessment</p>
                        <p className="text-[12px] text-text-secondary leading-relaxed">Respiratory rhythm stable. No signs of distress observed during sleep cycle.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-slate-800/30 rounded-3xl border border-theme-border">
                      <div className="w-10 h-10 rounded-full bg-accent-yellow/20 flex items-center justify-center shrink-0">
                        <Droplets className="w-5 h-5 text-accent-yellow" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary mb-1">Fluid Intake</p>
                        <p className="text-[12px] text-text-secondary leading-relaxed">Feeding schedule maintained. Hydration levels optimal.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-glass rounded-5xl p-8 flex flex-col items-center text-center">
                  <div className="flex justify-between w-full mb-6">
                    <div className="p-3 bg-cyan-400/20 rounded-2xl">
                      <LayoutGrid className="w-5 h-5 text-accent-cyan" />
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-theme-card-hover rounded-full hover:bg-slate-700 transition-colors"><ChevronLeft className="w-3 h-3" /></button>
                      <button className="p-2 bg-theme-card-hover rounded-full hover:bg-slate-700 transition-colors"><ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-2">Wellness Score</p>
                  <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#1e293b" strokeWidth="12" />
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#22d3ee" strokeWidth="12" strokeDasharray="502" strokeDashoffset={502 * (1 - 0.85)} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <h4 className="text-5xl font-black text-text-primary">8.5<span className="text-2xl text-text-secondary">/10</span></h4>
                      <p className="text-[12px] font-bold text-accent-yellow uppercase tracking-widest mt-1">Excellent</p>
                    </div>
                  </div>
                  <div className="w-full mb-6">
                    <button 
                      onClick={() => setShowNurseInfo(!showNurseInfo)}
                      className="flex items-center justify-between gap-3 p-3 bg-theme-border/50 rounded-2xl w-full hover:bg-slate-800 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img src="/nurse_avatar.png" alt="Nurse" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <p className="text-[12px] font-bold text-text-primary uppercase italic">Nurse Priya</p>
                          <p className="text-[10px] text-text-secondary uppercase tracking-widest">Primary Caregiver</p>
                        </div>
                      </div>
                      {showNurseInfo ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                    </button>

                    <AnimatePresence>
                      {showNurseInfo && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 px-1 space-y-2">
                            <div className="bg-theme-card rounded-xl p-3 border border-theme-border">
                              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Experience</p>
                              <p className="text-sm text-text-primary font-medium">8+ Years in Neonatal Care</p>
                            </div>
                            <div className="bg-theme-card rounded-xl p-3 border border-theme-border">
                              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Specialty</p>
                              <p className="text-sm text-text-primary font-medium">Acute Respiratory Management</p>
                            </div>
                            <div className="bg-theme-card rounded-xl p-3 border border-theme-border">
                              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Current Shift</p>
                              <p className="text-sm text-accent-yellow font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-accent-yellow rounded-full animate-pulse" />
                                On Duty (07:00 - 19:00)
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={() => setShowSlides(true)} 
                    className="w-full py-4 bg-accent-cyan/10 border border-accent-cyan/20 rounded-3xl flex flex-col items-center gap-3 group hover:bg-cyan-500/20 transition-all duration-300"
                  >
                    <div className="p-3 bg-cyan-400/20 rounded-2xl group-hover:scale-110 transition-transform">
                      <Presentation className="w-6 h-6 text-accent-cyan" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-accent-cyan uppercase tracking-[0.2em] mb-1">Clinical Strategy</p>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest">View 10-Slide Deck</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'Health' ? (
            <HealthPage />
          ) : activeTab === 'Clinical' ? (
            <ClinicalPage />
          ) : (
            <RecordsPage selectedDate={selectedDate} records={records} onRecordRead={markRecordAsRead} />
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
