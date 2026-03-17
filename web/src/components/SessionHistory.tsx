"use client";

import { motion } from "framer-motion";
import { Coffee, Flame, Moon, Sparkles, Wind } from "lucide-react";

type EmotionState = "focus" | "calm" | "tired";

interface SessionData {
  time: string;
  state: EmotionState;
  intensity: number; // 0 to 100
}

const mockData: SessionData[] = [
  { time: "09:00", state: "tired", intensity: 60 },
  { time: "09:30", state: "calm", intensity: 45 },
  { time: "10:15", state: "focus", intensity: 85 },
  { time: "11:00", state: "focus", intensity: 90 },
  { time: "11:45", state: "tired", intensity: 75 },
  { time: "12:30", state: "calm", intensity: 80 },
];

const stateConfig = {
  focus: {
    color: "from-orange-500/80 to-amber-500/60",
    bg: "bg-orange-500/10",
    text: "text-orange-200",
    icon: Flame,
    label: "Deep Focus",
  },
  calm: {
    color: "from-blue-400/80 to-indigo-500/60",
    bg: "bg-blue-500/10",
    text: "text-blue-200",
    icon: Wind,
    label: "Mindful Calm",
  },
  tired: {
    color: "from-purple-500/80 to-violet-500/60",
    bg: "bg-purple-500/10",
    text: "text-purple-200",
    icon: Moon,
    label: "Cognitive Fatigue",
  },
};

export default function SessionHistory() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-24 px-6 md:px-12 pb-24 relative z-10">
      <div className="flex items-end justify-between mb-12">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-serif text-slate-100 tracking-wide font-light">
            Morning Flow Analysis
          </h3>
          <p className="text-sm font-sans text-slate-400/80 tracking-widest uppercase">
            Today • 4h 12m tracked
          </p>
        </div>
        
        <div className="flex gap-4 items-center mb-1">
          {Object.entries(stateConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-slate-400/70">
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.color}`} />
                <span className="hidden md:inline">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative h-48 w-full flex items-end justify-between gap-1 md:gap-3 rounded-2xl bg-slate-900/40 border border-white/5 p-6 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-0" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

        {mockData.map((data, idx) => {
          const config = stateConfig[data.state];
          const Icon = config.icon;
          
          return (
            <div key={idx} className="relative flex flex-col items-center flex-1 h-full z-10 group">
              {/* Tooltip (Hover) */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col items-center z-20">
                <div className={`px-3 py-1.5 rounded-md backdrop-blur-md border border-white/10 ${config.bg} shadow-lg flex items-center gap-2`}>
                  <Icon className={`w-3 h-3 ${config.text}`} />
                  <span className={`text-[10px] font-sans uppercase tracking-widest font-semibold ${config.text}`}>
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full max-w-[48px] h-full flex items-end justify-center pb-8 group-hover:opacity-100 transition-all duration-500">
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${data.intensity}%`, opacity: 1 }}
                  transition={{ duration: 1.5, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative w-full rounded-t-lg bg-gradient-to-t ${config.color} shadow-[0_0_15px_rgba(255,255,255,0.05)] overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
                  <div className="absolute top-0 inset-x-0 h-1 bg-white/30 rounded-t-lg" />
                </motion.div>
              </div>

              {/* Timeline Label */}
              <div className="absolute bottom-0 text-[10px] sm:text-xs font-sans text-slate-500/80 tracking-wider">
                {data.time}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Insight Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="mt-8 flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/10"
      >
        <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-serif text-indigo-100 text-lg mb-1">Aesthetic Flow State Achieved</h4>
          <p className="text-sm font-sans text-slate-400/90 leading-relaxed tracking-wide">
            Your vocal cadence shifted into a deep focus zone between 10:15 and 11:30. 
            The micro-tremors in your voice decreased by 40%, indicating high cognitive immersion. 
            Consider taking brief mindful breaks to sustain this energy into the afternoon.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
