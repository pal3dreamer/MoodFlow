'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Database, Cloud, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const sections = [
    { name: 'Profile', icon: User, description: 'Manage your identity and session preferences.' },
    { name: 'Notifications', icon: Bell, description: 'Configure focus reminders and alerts.' },
    { name: 'Privacy & Security', icon: Shield, description: 'Encryption keys and data access.' },
    { name: 'Data Management', icon: Database, description: 'Export history or clear local storage.' },
    { name: 'Integrations', icon: Cloud, description: 'Connect with Calendar or Slack.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 pt-16">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-display font-bold text-slate-900 mb-4 tracking-tight">Preferences</h1>
        <p className="text-slate-500 text-lg max-w-sm mx-auto">Tune MoodFlow to match your work environment.</p>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        {sections.map((section, index) => (
          <motion.div 
            key={section.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between p-8 cursor-pointer group hover:bg-slate-50 transition-all ${
              index !== sections.length - 1 ? 'border-b border-slate-50' : ''
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300">
                <section.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900">{section.name}</h3>
                <p className="text-slate-400 text-sm">{section.description}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 group-hover:text-slate-400 transition-colors">
              <ChevronRight size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
          MoodFlow Build v0.9.1 • Beta Release
        </p>
      </div>
    </div>
  );
}
