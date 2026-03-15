'use client';

import React, { useState, useEffect } from 'react';
import AudioRecorder from '@/components/AudioRecorder';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Sparkles, Layout, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  topic: string;
  startTime: string;
  endTime?: string;
  startEmotion?: any;
  endEmotion?: any;
  duration?: number;
}

export default function Home() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'start.wav');

      const response = await api.post('/api/session/start', formData);
      setActiveSession(response.data);
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setError(err.response?.data?.error || 'Failed to start session');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndSession = async (audioBlob: Blob) => {
    if (!activeSession) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'end.wav');
      formData.append('sessionId', activeSession.id);

      const response = await api.post('/api/session/end', formData);
      setActiveSession(null);
      // Redirect or show success modal here
    } catch (err: any) {
      console.error('Failed to end session:', err);
      setError(err.response?.data?.error || 'Failed to end session');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderEmotion = (emotion: any) => {
    if (!emotion) return 'Neutral';
    const strongest = Object.entries(emotion).reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b);
    return strongest[0];
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Dynamic background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-emerald-200/40 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-blue-200/40 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-xl">
        <header className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-slate-100 shadow-sm"
          >
            <Sparkles size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Mindful Productivity</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl font-display font-bold text-slate-900 tracking-tighter"
          >
            MoodFlow
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg max-w-sm mx-auto leading-relaxed"
          >
            Align your emotional state with your creative output.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 20 }}
          className="relative"
        >
          <AnimatePresence mode="wait">
            {activeSession && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute -top-32 inset-x-0 flex flex-col items-center text-center space-y-4"
              >
                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Active Focus Session
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-slate-900">{activeSession.topic}</h2>
                  <p className="text-slate-500 text-sm">
                    Feeling <span className="text-slate-900 font-semibold uppercase tracking-widest text-[10px]">{renderEmotion(activeSession.startEmotion)}</span> • Started {formatDistanceToNow(new Date(activeSession.startTime))} ago
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AudioRecorder
            onRecordingComplete={activeSession ? handleEndSession : handleStartSession}
            isProcessing={isProcessing}
          />
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-red-50 border border-red-100 rounded-3xl text-red-700 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <footer className="mt-20 flex justify-center gap-12">
          <div className="text-center group cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
              <Activity size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Insights</span>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
              <Layout size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Archive</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
