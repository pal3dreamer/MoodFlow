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
  const name = (strongest[0] as string).toLowerCase();
  
  if (['calm', 'focus', 'content'].some(e => name.includes(e))) return <Smile size={16} className="text-emerald-500" />;
  if (['stress', 'anxious', 'tired'].some(e => name.includes(e))) return <Zap size={16} className="text-amber-500" />;
  if (['sad', 'frustrated', 'exhausted'].some(e => name.includes(e))) return <Frown size={16} className="text-rose-500" />;
  return <Activity size={16} className="text-blue-500" />;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/api/session');
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
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
    <div className="max-w-4xl mx-auto py-12">
      <header className="mb-16">
        <h1 className="text-6xl font-serif font-bold text-stone-900 mb-4 tracking-tight italic">Timeline.</h1>
        <p className="text-stone-400 text-lg">A reflective journey through your focus sessions.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-950 rounded-full animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-stone-100 p-16 text-center shadow-sm"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-stone-50 rounded-3xl mb-8 text-stone-200">
            <Calendar size={48} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">No footprints found</h3>
          <p className="text-stone-400 max-w-sm mx-auto mb-10 leading-relaxed">
            Your emotional journey begins with your first voice check-in.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-3 px-10 py-5 bg-stone-950 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95 shadow-xl"
          >
            Start First Session
            <ChevronRight size={18} />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8 relative">
          {/* Timeline line */}
          <div className="absolute left-[39px] top-0 bottom-0 w-px bg-stone-100 -z-10" />
          
          {history.map((session, index) => (
            <Link
              key={session.id}
              href={`/session/${session.id}`}
              className="group relative flex gap-8 items-start"
            >
              <div className="w-20 pt-8 flex flex-col items-center shrink-0">
                <div className="w-4 h-4 rounded-full border-4 border-white bg-stone-950 ring-4 ring-stone-50" />
              </div>

              <div className="flex-1 bg-white hover:bg-stone-50 transition-all duration-500 rounded-[2.5rem] border border-stone-100 p-10 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-stone-200/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 bg-stone-950 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {format(new Date(session.startTime), 'MMM d, h:mm a')}
                      </span>
                      {session.duration && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                          <Clock size={12} />
                          {Math.floor(session.duration / 60)}m {session.duration % 60}s
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-3xl font-serif font-bold text-stone-900 group-hover:text-stone-950 transition-colors tracking-tight">
                      {session.topic || 'Unnamed Focus Session'}
                    </h2>

                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-stone-50 rounded-xl">
                          <EmotionIcon emotion={session.startEmotion} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Entry</span>
                          <span className="text-sm font-bold text-stone-900">{renderEmotion(session.startEmotion)}</span>
                        </div>
                      </div>
                      </div>
                      
                      {session.endEmotion && (
                        <>
                          <ChevronRight size={16} className="text-stone-200" />
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-stone-50 rounded-xl">
                              <EmotionIcon emotion={session.endEmotion} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Exit</span>
                              <span className="text-sm font-bold text-stone-900">{renderEmotion(session.endEmotion)}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="w-14 h-14 rounded-2xl border border-stone-100 flex items-center justify-center text-stone-200 group-hover:border-stone-900 group-hover:text-stone-900 transition-all duration-500">
                    <ChevronRight size={28} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
      )}
    </div>
  );
}
