'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronLeft, Clock, Activity, MessageSquare, Quote } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function SessionDetailPage() {
  const params = useParams();
  const idParam = params?.id;
  const sessionId = Array.isArray(idParam) ? idParam[0] : idParam;
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      try {
        const response = await api.get(`/api/session/${sessionId}`);
        setSession(response.data);
      } catch (err) {
        console.error('Failed to fetch session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-950 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-stone-900">Session not found</h2>
        <Link href="/history" className="text-stone-400 hover:text-stone-950 underline mt-4 inline-block">Return to Timeline</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12">
      <Link 
        href="/history"
        className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-950 transition-colors mb-12 group font-bold uppercase tracking-[0.2em] text-[10px]"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Timeline
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-stone-950 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
              {format(new Date(session.startTime), 'MMMM d, yyyy')}
            </span>
            {session.duration && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                <Clock size={12} />
                {Math.floor(session.duration / 60)}m {session.duration % 60}s
              </span>
            )}
          </div>
          <h1 className="text-6xl font-serif font-bold text-stone-900 tracking-tight">{session.topic}</h1>
        </div>
        
        <div className="flex gap-12 border-l border-stone-100 pl-12">
          <div className="text-right">
            <p className="text-stone-300 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Entry</p>
            <p className="text-xl font-serif italic text-stone-950">
              {Object.entries(session.startEmotion || {}).reduce((a: any, b: any) => a[1] > b[1] ? a : b, ['', 0])[0] || 'Neutral'}
            </p>
          </div>
          {session.endEmotion && (
            <div className="text-right">
              <p className="text-stone-300 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Exit</p>
              <p className="text-xl font-serif italic text-stone-950">
                {Object.entries(session.endEmotion).reduce((a: any, b: any) => a[1] > b[1] ? a : b, ['', 0])[0]}
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Left Column: Emotion Trajectory */}
        <div className="xl:col-span-8 space-y-12">
          <section className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-950">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-serif font-bold">Emotion Trajectory</h3>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={session.checkins.map((c: any, i: number) => ({
                  time: i === 0 ? 'Start' : 'End',
                  calm: c.emotionVector?.calm || 0,
                  focus: c.emotionVector?.focus || 0,
                  stress: c.emotionVector?.stress || 0,
                }))}>
                  <defs>
                    <linearGradient id="colorCalm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="calm" stroke="#10b981" fillOpacity={1} fill="url(#colorCalm)" strokeWidth={3} />
                  <Area type="monotone" dataKey="focus" stroke="#3b82f6" fillOpacity={0} strokeWidth={3} />
                  <Area type="monotone" dataKey="stress" stroke="#f43f5e" fillOpacity={0} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Calmness</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Stress</span>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-950">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-xl font-serif font-bold">Transcriptions</h3>
            </div>
            
            <div className="space-y-4">
              {session.checkins.map((checkin: any, index: number) => (
                <motion.div 
                  key={checkin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-stone-100 flex gap-6"
                >
                  <div className="shrink-0 pt-1">
                    <Quote className="text-stone-100" size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                      {index === 0 ? 'Initial Intent' : `Check-in ${index}`} — {format(new Date(checkin.timestamp), 'h:mm a')}
                    </p>
                    <p className="text-stone-700 leading-relaxed font-medium italic italic-serif">
                      "{checkin.transcription || 'No transcription available.'}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Metadata */}
        <aside className="xl:col-span-4 space-y-8">
          <div className="p-10 bg-stone-950 rounded-[2.5rem] text-white">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-8">Session Meta</h4>
            <div className="space-y-8">
              <div>
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-2">Internal ID</p>
                <p className="text-xs font-mono text-stone-300 break-all">{session.id}</p>
              </div>
              <div>
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-2">Audio Source</p>
                <p className="text-xs text-stone-300">MinIO Object Store (S3 Compatible)</p>
              </div>
              <div>
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-2">AI Models</p>
                <p className="text-xs text-stone-300">Whisper-Base • WavLM-Large</p>
              </div>
            </div>
          </div>
          
          <div className="p-10 bg-stone-50 border border-stone-100 rounded-[2.5rem]">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-6">Cognitive Insight</h4>
            <p className="text-sm text-stone-500 leading-relaxed">
              Vocal variance suggests a <strong>steady cognitive flow</strong> during this session. The transition from 
              <em> {renderEmotion(session.startEmotion)}</em> to 
              <em> {renderEmotion(session.endEmotion)}</em> indicates successful mental task completion.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );

  function renderEmotion(emotion: any) {
    if (!emotion) return 'Neutral';
    const strongest = Object.entries(emotion).reduce((a: any, b: any) => a[1] > b[1] ? a : b, ['', 0]);
    return strongest[0];
  }
}
