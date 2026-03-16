'use client';

import React, { useState, useEffect } from 'react';
import AudioRecorder from '@/components/AudioRecorder';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Sparkles, Layout, Clock, BookOpen, ArrowUpRight } from 'lucide-react';
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

  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const response = await api.get('/api/session/active');
        if (response.data) {
          setActiveSession(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch active session:', err);
      }
    };
    fetchActiveSession();
  }, []);

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
      await api.post('/api/session/end', formData);
      setActiveSession(null);
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
    <div className="max-w-6xl mx-auto py-12">
      <header className="flex items-end justify-between mb-24">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-stone-400 font-bold uppercase tracking-[0.2em] text-[10px]"
          >
            <Sparkles size={12} />
            Mindful Workspace
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl font-serif font-bold tracking-tight text-stone-900"
          >
            Deep Flow.
          </motion.h1>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-right hidden md:block"
        >
          <p className="text-stone-400 text-sm font-medium">Session Context</p>
          <p className="text-stone-950 font-serif text-xl italic">{activeSession ? activeSession.topic : 'Awaiting initialization'}</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
        <div className="xl:col-span-8 space-y-12">
          <section>
            <AnimatePresence mode="wait">
              {activeSession ? (
                <motion.div 
                  key="active"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="bg-stone-950 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-stone-200"
                >
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-1">
                      <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.3em]">Current State</p>
                      <h2 className="text-4xl font-serif font-bold italic tracking-tight">{renderEmotion(activeSession.startEmotion)}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.3em]">Elapsed</p>
                      <div className="text-3xl font-mono font-light text-stone-200">
                        {formatDistanceToNow(new Date(activeSession.startTime))}
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 w-full mb-12" />
                  <AudioRecorder
                    onRecordingComplete={handleEndSession}
                    isProcessing={isProcessing}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="p-1 border border-stone-200 rounded-[3rem]">
                    <div className="bg-white rounded-[2.8rem] p-12 border border-stone-100 shadow-sm">
                      <AudioRecorder
                        onRecordingComplete={handleStartSession}
                        isProcessing={isProcessing}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-white border border-stone-100 rounded-3xl hover:border-stone-200 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900 group-hover:bg-stone-950 group-hover:text-white transition-colors">
                  <BookOpen size={20} />
                </div>
                <ArrowUpRight size={20} className="text-stone-200 group-hover:text-stone-900 transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Cognitive Load</h3>
              <p className="text-stone-400 text-sm leading-relaxed">View patterns of stress and mental fatigue across your session history.</p>
            </div>
            <div className="p-8 bg-white border border-stone-100 rounded-3xl hover:border-stone-200 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900 group-hover:bg-stone-950 group-hover:text-white transition-colors">
                  <Activity size={20} />
                </div>
                <ArrowUpRight size={20} className="text-stone-200 group-hover:text-stone-900 transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Focus Peaks</h3>
              <p className="text-stone-400 text-sm leading-relaxed">Identify your peak performance hours based on vocal tonality analysis.</p>
            </div>
          </section>
        </div>

        <aside className="xl:col-span-4 space-y-8">
          <div className="p-8 bg-stone-50 border border-stone-100 rounded-[2rem]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-stone-200/50">
                <span className="text-xs font-medium text-stone-600">AI Processing</span>
                <span className="text-xs font-bold text-emerald-600">Nominal</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-stone-200/50">
                <span className="text-xs font-medium text-stone-600">MinIO Cluster</span>
                <span className="text-xs font-bold text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-stone-600">Prisma Engine</span>
                <span className="text-xs font-bold text-emerald-600">V7.5.0</span>
              </div>
            </div>
          </div>
          
          <div className="relative p-8 overflow-hidden rounded-[2rem] bg-rose-500 text-white">
            <div className="relative z-10 space-y-4">
              <h4 className="text-xl font-serif italic font-bold">New Perspective</h4>
              <p className="text-rose-100 text-xs leading-relaxed opacity-80">
                "Productivity is being able to do things that you were never able to do before."
              </p>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10" />
          </div>
        </aside>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs text-center font-bold tracking-widest uppercase"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
