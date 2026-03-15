'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Brain, Info } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-16">
      <header className="mb-12">
        <h1 className="text-5xl font-display font-bold text-slate-900 mb-4 tracking-tight">Insights</h1>
        <p className="text-slate-500 text-lg">Deep analytics of your emotional focus patterns.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Focus Stability</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            We're aggregating your session data to visualize how your focus evolves over the week.
          </p>
          <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-full bg-emerald-500"
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Progress</span>
            <span>65% Calibrated</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl shadow-slate-200"
        >
          <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6">
            <Brain size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">Emotional Mapping</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            AI-driven patterns of your pre and post-session states. Coming soon in v1.0.
          </p>
          <div className="mt-8 flex gap-2">
            {[1, 0.6, 0.4, 0.8, 0.5].map((op, i) => (
              <div key={i} className="flex-1 h-12 bg-white/10 rounded-lg flex items-end overflow-hidden">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${op * 100}%` }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className="w-full bg-white/20"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-start gap-4"
      >
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Info size={18} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900">About Insights</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            Our AI analyzes the harmonic features and prosody of your voice recordings to detect subtle emotional shifts. 
            Privacy is prioritized: audio is processed and stored in your secure local instance.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
