'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Info, PieChart as PieIcon, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function InsightsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/analytics');
        setAnalytics(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#0c0a09', '#f43f5e', '#10b981', '#3b82f6', '#f59e0b'];

  if (isLoading) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-950 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12">
      <header className="mb-16">
        <h1 className="text-6xl font-serif font-bold text-stone-900 mb-4 tracking-tight italic">Analytics.</h1>
        <p className="text-stone-400 text-lg">Deep visualization of your emotional focus patterns.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Focus Stability Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm col-span-1"
        >
          <div className="w-14 h-14 bg-stone-50 text-stone-950 rounded-2xl flex items-center justify-center mb-8">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Focus Stability</h3>
          <p className="text-stone-400 text-sm leading-relaxed mb-10">
            A metric of how consistently you maintain deep focus sessions over time.
          </p>
          <div className="relative h-4 bg-stone-50 rounded-full overflow-hidden mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${analytics?.focusStability || 0}%` }}
              transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
              className="h-full bg-stone-950"
            />
          </div>
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Calibration</span>
            <span className="text-4xl font-mono font-light text-stone-950">{analytics?.focusStability || 0}%</span>
          </div>
        </motion.div>

        {/* Emotional Distribution Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm col-span-1 xl:col-span-2"
        >
          <div className="flex justify-between items-start mb-8">
            <div className="w-14 h-14 bg-stone-50 text-stone-950 rounded-2xl flex items-center justify-center">
              <PieIcon size={28} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Total Sessions</p>
              <p className="text-3xl font-mono font-light text-stone-950">{analytics?.sessionCount || 0}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.emotionalDistribution || [{ name: 'No Data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(analytics?.emotionalDistribution || [{ name: 'Empty', value: 1 }]).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-stone-900">Emotional Mix</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Distribution of your emotional entry states across all recorded sessions.
              </p>
              <div className="pt-4 space-y-2">
                {analytics?.emotionalDistribution?.map((item: any, i: number) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">{item.name}</span>
                    <span className="text-xs text-stone-300 ml-auto font-mono">{item.value} sessions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cognitive Load (Mock Visualization) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-stone-950 p-10 rounded-[2.5rem] text-white shadow-2xl col-span-1 xl:col-span-3"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center">
              <Brain size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold">Vocal Prosody Timeline</h3>
              <p className="text-stone-500 text-sm tracking-tight">Real-time harmonic analysis of session intensity.</p>
            </div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.recentSessions || []}>
                <XAxis dataKey="topic" hide />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0c0a09', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                />
                <Bar 
                  dataKey="duration" 
                  fill="#f43f5e" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex justify-between text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em]">
            <span>Past 10 Sessions</span>
            <span>Intensity (Duration Based)</span>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 p-8 bg-stone-50 border border-stone-100 rounded-[2rem] flex items-start gap-6"
      >
        <div className="p-3 bg-stone-950 text-white rounded-xl shadow-lg">
          <Info size={20} />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Methodology</h4>
          <p className="text-sm text-stone-500 leading-relaxed max-w-3xl">
            Our AI analysis correlates vocal frequency variance with cognitive load markers. 
            The charts above synthesize duration, emotional variance, and session frequency into a 
            cohesive map of your creative output.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
