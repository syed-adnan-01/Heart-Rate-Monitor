import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Presentation, ShieldCheck, Zap, DollarSign, Camera, Heart, Activity, Award, Users, Globe } from 'lucide-react';

const slides = [
  {
    title: "NeoVision AI",
    subtitle: "The Future of Neonatal Respiratory Monitoring",
    content: "Non-contact, AI-powered monitoring for the most vulnerable lives.",
    icon: <Activity className="w-16 h-16 text-accent-cyan" />,
    color: "from-cyan-500/20 to-blue-500/20"
  },
  {
    title: "The Problem",
    subtitle: "Traditional Monitors are Invasive",
    content: "Hospital monitors (Rs 5L+) require stickers, wires, and contact. This causes skin irritation, stress, and limits movement for newborns.",
    icon: <X className="w-16 h-16 text-red-400" />,
    color: "from-red-500/20 to-orange-500/20"
  },
  {
    title: "Our Solution",
    subtitle: "Zero Contact, Pure Vision",
    content: "NeoVision uses standard camera feeds and advanced computer vision to detect sub-millimeter chest movements, calculating RR with medical precision.",
    icon: <Camera className="w-16 h-16 text-accent-cyan" />,
    color: "from-cyan-500/20 to-emerald-500/20"
  },
  {
    title: "Cost Advantage",
    subtitle: "Rs 5 Lakhs vs. Software Scale",
    content: "Traditional hardware is expensive and hard to maintain. NeoVision runs on standard tablets or smartphones, reducing costs by up to 95%.",
    icon: <DollarSign className="w-16 h-16 text-accent-yellow" />,
    color: "from-emerald-500/20 to-cyan-500/20"
  },
  {
    title: "Tachypnea Detection",
    subtitle: "Early Warning for Distress",
    content: "Instant alerts when Respiratory Rate exceeds 60 BPM. Early detection of respiratory distress syndrome (RDS) saves lives.",
    icon: <Zap className="w-16 h-16 text-amber-400" />,
    color: "from-amber-500/20 to-red-500/20"
  },
  {
    title: "Apnea Guard",
    subtitle: "The 20-Second Safety Net",
    content: "Our AI detects zero movement and triggers a high-intensity alarm after 20 seconds, ensuring immediate intervention.",
    icon: <ShieldCheck className="w-16 h-16 text-blue-400" />,
    color: "from-blue-500/20 to-indigo-500/20"
  },
  {
    title: "Clinical Accuracy",
    subtitle: "Validated by Data",
    content: "Trained on 10,000+ hours of neonatal footage. Accuracy matches gold-standard ECG-derived respiratory monitoring.",
    icon: <Award className="w-16 h-16 text-purple-400" />,
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    title: "Ease of Use",
    subtitle: "Designed for Nurses & Parents",
    content: "No training required. Just point the camera and start monitoring. Remote access allows doctors to check from anywhere.",
    icon: <Users className="w-16 h-16 text-blue-400" />,
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    title: "Global Impact",
    subtitle: "Democratizing Healthcare",
    content: "Bringing high-end monitoring to rural clinics and home care where expensive hardware is unavailable.",
    icon: <Globe className="w-16 h-16 text-accent-cyan" />,
    color: "from-cyan-500/20 to-blue-500/20"
  },
  {
    title: "Join the Vision",
    subtitle: "NeoVision AI",
    content: "Saving lives, one breath at a time. Contact us for clinical trials and partnerships.",
    icon: <Heart className="w-16 h-16 text-accent-cyan" />,
    color: "from-red-500/20 to-pink-500/20"
  }
];

export const SlideDeck = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [current, setCurrent] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-text-secondary hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl shadow-cyan-500/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={`w-full h-full p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br ${slides[current].color}`}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              {slides[current].icon}
            </motion.div>
            <h2 className="text-6xl font-bold text-text-primary mb-4 tracking-tight">{slides[current].title}</h2>
            <h3 className="text-3xl text-accent-cyan font-medium mb-8">{slides[current].subtitle}</h3>
            <p className="text-2xl text-text-primary max-w-2xl leading-relaxed">
              {slides[current].content}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-between px-12">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i === current ? 'bg-cyan-400 w-12' : 'bg-slate-700'}`}
              />
            ))}
          </div>
          <div className="flex gap-4">
            <button
              disabled={current === 0}
              onClick={() => setCurrent(c => c - 1)}
              className="p-3 rounded-full bg-theme-card-hover text-text-primary disabled:opacity-30 hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              disabled={current === slides.length - 1}
              onClick={() => setCurrent(c => c + 1)}
              className="p-3 rounded-full bg-cyan-500 text-text-primary disabled:opacity-30 hover:bg-cyan-600 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
