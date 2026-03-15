'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Clock, Calendar, ChevronRight, Activity, Smile, Frown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Session {
  id: string;
  topic: string;
  startTime: string;
  endTime?: string;
  startEmotion?: any;
  endEmotion?: any;
  duration?: number;
}

const EmotionIcon = ({ emotion }: { emotion: any }) => {
  if (!emotion) return <Activity size={16} />;
  const strongest = Object.entries(emotion).reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b);
  const name = strongest[0].toLowerCase();
  
  if (['calm', 'focus', 'content'].some(e => name.includes(e))) return <Smile size={16} className="text-emerald-500" />;
  if (['stress', 'anxious', 'tired'].some(e => name.includes(e))) return <Zap size={16} className="text-amber-500" />;
  if (['sad', 'frustrated', 'exhausted'].some(e => name.includes(e))) return <Frown size={16} className="text-rose-500" />;
  return <Activity size={16} className="text-blue-500" />;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from /api/sessions
    // For now, we'll try to fetch what we have or show a placeholder
    const fetchHistory = async () => {
      try {
        // Since we don't have a bulk GET yet, we might just show an empty state or mock
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const renderEmotion = (emotion: any) => {
    if (!emotion) return null;
    const strongest = Object.entries(emotion).reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b);
    return strongest[0];
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-16">
      <header className="mb-12">
        <h1 className="text-5xl font-display font-bold text-slate-900 mb-4 tracking-tight">Timeline</h1>
        <p className="text-slate-500 text-lg">A reflective journey through your focus sessions.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-6 text-slate-300">
            <Calendar size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No footprints found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Your emotional journey begins with your first voice check-in. Ready to start?
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-transform hover:scale-105 active:scale-95"
          >
            Go to Dashboard
            <ChevronRight size={18} />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {history.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white hover:bg-slate-50 transition-colors rounded-[2rem] border border-slate-100 p-8 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {format(new Date(session.startTime), 'MMM d, h:mm a')}
                    </span>
                    {session.duration && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        <Clock size={12} />
                        {Math.floor(session.duration / 60)}m
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {session.topic || 'Unnamed Focus Session'}
                  </h2>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <EmotionIcon emotion={session.startEmotion} />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        Entry: <span className="text-slate-900">{renderEmotion(session.startEmotion)}</span>
                      </span>
                    </div>
                    
                    {session.endEmotion && (
                      <>
                        <ChevronRight size={14} className="text-slate-300" />
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-50 rounded-xl">
                            <EmotionIcon emotion={session.endEmotion} />
                          </div>
                          <span className="text-xs font-medium text-slate-600">
                            Exit: <span className="text-slate-900">{renderEmotion(session.endEmotion)}</span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-emerald-200 group-hover:text-emerald-500 transition-all">
                  <ChevronRight size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
