'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: null, active: false },
  { label: 'Sessions', href: '/dashboard/sessions', icon: null, active: false },
  { label: 'Insights', href: '/dashboard/insights', icon: null, active: true },
  { label: 'Recordings', href: '/dashboard/recordings', icon: null, active: false },
  { label: 'Settings', href: '/dashboard/settings', icon: null, active: false },
]

const vadData = [
  { time: '0', valence: 65, arousal: 45, dominance: 70 },
  { time: '10', valence: 75, arousal: 55, dominance: 80 },
  { time: '20', valence: 80, arousal: 70, dominance: 85 },
  { time: '30', valence: 70, arousal: 65, dominance: 75 },
  { time: '40', valence: 55, arousal: 80, dominance: 60 },
  { time: '50', valence: 45, arousal: 85, dominance: 50 },
  { time: '60', valence: 40, arousal: 70, dominance: 45 },
  { time: '70', valence: 50, arousal: 50, dominance: 55 },
  { time: '80', valence: 60, arousal: 40, dominance: 65 },
]

const emotionTimeline = [
  { range: '0-10 min', emotion: 'Calm', duration: '10 min', color: 'bg-green-500' },
  { range: '10-25 min', emotion: 'Focused', duration: '15 min', color: 'bg-blue-500' },
  { range: '25-35 min', emotion: 'Stressed', duration: '10 min', color: 'bg-red-500' },
  { range: '35-50 min', emotion: 'Fatigued', duration: '15 min', color: 'bg-yellow-500' },
  { range: '50-60 min', emotion: 'Focused', duration: '10 min', color: 'bg-blue-500' },
]

const sessionPhases = [
  { phase: 'Warm-up', duration: '8 min', dominant: 'Calm', score: 72 },
  { phase: 'Deep Focus', duration: '22 min', dominant: 'Focused', score: 91 },
  { phase: 'Stress', duration: '12 min', dominant: 'Stressed', score: 45 },
  { phase: 'Recovery', duration: '10 min', dominant: 'Calm', score: 68 },
  { phase: 'Wind Down', duration: '8 min', dominant: 'Fatigued', score: 52 },
]

const weeklyData = [
  { day: 'Mon', emotion: 'Calm', focus: 72, stress: 18 },
  { day: 'Tue', emotion: 'Focused', focus: 85, stress: 15 },
  { day: 'Wed', emotion: 'Stressed', focus: 55, stress: 65 },
  { day: 'Thu', emotion: 'Focused', focus: 78, stress: 22 },
  { day: 'Fri', emotion: 'Calm', focus: 68, stress: 25 },
  { day: 'Sat', emotion: 'Fatigued', focus: 45, stress: 35 },
  { day: 'Sun', emotion: 'Calm', focus: 75, stress: 12 },
]

const emotionDistribution = [
  { emotion: 'Focused', value: 42, color: 'bg-blue-500' },
  { emotion: 'Calm', value: 28, color: 'bg-green-500' },
  { emotion: 'Stressed', value: 18, color: 'bg-red-500' },
  { emotion: 'Fatigued', value: 12, color: 'bg-yellow-500' },
]

const audioSegments = [
  { time: '12:20', emotion: 'Frustration', duration: '2 min', icon: null },
  { time: '18:40', emotion: 'Engagement Peak', duration: '5 min', icon: null },
  { time: '24:10', emotion: 'Fatigue Detected', duration: '8 min', icon: null },
  { time: '35:00', emotion: 'Stress Spike', duration: '3 min', icon: null },
  { time: '45:30', emotion: 'Flow State', duration: '10 min', icon: null },
]

const aiInsights = [
  { text: 'You tend to become stressed after 45 minutes of working. Consider taking a break.', type: 'stress' },
  { text: 'Your focus is strongest between 20–35 minutes into a session.', type: 'focus' },
  { text: 'Evening sessions show 30% higher fatigue levels than morning sessions.', type: 'time' },
  { text: 'Shorter sessions (under 40 min) correlate with 25% better retention.', type: 'productivity' },
]

const aiRecommendations = [
  'Take a 5-minute break after 40 minutes of work.',
  'Schedule important tasks during morning hours (9–11 AM).',
  'Keep sessions under 45 minutes to maintain peak focus.',
  'End sessions before fatigue sets in for better information retention.',
]

const sessions = [
  { name: 'Algorithms Study', date: 'Today', duration: '1h 40m', focusPeak: '25 min', score: 82 },
  { name: 'Math Problem Set', date: 'Yesterday', duration: '45m', focusPeak: '30 min', score: 76 },
  { name: 'Reading Review', date: '2 days ago', duration: '30m', focusPeak: '15 min', score: 88 },
  { name: 'Lab Report', date: '3 days ago', duration: '2h 15m', focusPeak: '40 min', score: 58 },
]

export default function Insights() {
  const [selectedTab, setSelectedTab] = useState('Analysis')

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-52 border-r border-white/10 flex-shrink-0 fixed h-full">
        <div className="p-4">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
              <span className="text-black font-bold text-xs">M</span>
            </div>
            <span className="text-white font-semibold text-sm">MoodFlow</span>
          </Link>

          <nav className="space-y-0.5">
            {sidebarLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  link.active
                    ? 'bg-white text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
               >
                 {link.icon && <span className="w-4 text-center text-xs">{link.icon}</span>}
                 {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-52 p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
            <div>
              <p className="text-sm font-medium">John</p>
              <p className="text-xs text-white/50">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

       {/* Main Content */}
       <main className="flex-1 ml-52 overflow-auto flex justify-center">
         <div className="p-6 w-full max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">Insights</h1>
            <p className="text-white/50 text-sm">AI-powered emotional analysis and behavioral patterns</p>
          </div>

          {/* Tab Selection */}
          <div className="flex gap-2 mb-6">
            {['Analysis', 'Sessions', 'Trends', 'Audio'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === tab
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

           {/* VAD Emotional Trajectory - Main Visualization */}
           <div className="grid grid-cols-12 gap-4 mb-4">
             <div className="col-span-9 bg-white/5 border border-white/10 rounded-xl p-5">
               <div className="mb-4">
                 <h2 className="text-base font-medium mb-4">Emotional Trajectory (VAD)</h2>
                 <div className="flex flex-wrap items-center gap-6 text-xs text-white/50">
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Valence</span>
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Arousal</span>
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Dominance</span>
                 </div>
               </div>
              
              <div className="relative h-32 mb-2">
                <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1="0" y1={i * 25} x2="500" y2={i * 25} stroke="white/5" strokeWidth="1" />
                  ))}
                  
                  {/* Valence */}
                  <path
                    d="M 0,35 L 62,25 L 125,20 L 187,30 L 250,45 L 312,55 L 375,60 L 437,50 L 500,40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  
                  {/* Arousal */}
                  <path
                    d="M 0,55 L 62,45 L 125,30 L 187,35 L 250,20 L 312,15 L 375,30 L 437,50 L 500,60"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  
                  {/* Dominance */}
                  <path
                    d="M 0,30 L 62,20 L 125,15 L 187,25 L 250,40 L 312,55 L 375,45 L 437,35 L 500,40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Stress marker */}
                  <circle cx="312" cy="15" r="4" fill="#ef4444" />
                  <text x="312" y="8" fill="#ef4444" fontSize="8" textAnchor="middle">stress</text>
                </svg>
                
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/30 px-1">
                  <span>0 min</span>
                  <span>10 min</span>
                  <span>20 min</span>
                  <span>30 min</span>
                  <span>40 min</span>
                  <span>50 min</span>
                  <span>60 min</span>
                  <span>70 min</span>
                  <span>80 min</span>
                </div>
              </div>

               {/* Insight Markers */}
               <div className="flex items-center gap-4 text-xs">
                 <div className="flex items-center gap-1 text-red-400">
                   <span>Stress spike at 50 min</span>
                 </div>
                 <div className="flex items-center gap-1 text-blue-400">
                   <span>Focus peak at 20 min</span>
                 </div>
                 <div className="flex items-center gap-1 text-yellow-400">
                   <span>Energy drop at 60 min</span>
                 </div>
               </div>
            </div>

            {/* Stress & Focus Metrics */}
            <div className="col-span-3 flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-medium">Focus Stability</h2>
                  <span className="text-2xl font-semibold text-green-400">78%</span>
                </div>
                <p className="text-xs text-white/50">Low variance indicates stable focus throughout sessions</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-medium">Emotional Consistency</h2>
                  <span className="text-2xl font-semibold text-blue-400">82%</span>
                </div>
                <p className="text-xs text-white/50">Your emotional patterns are predictable and stable</p>
              </div>
            </div>
          </div>

           {/* Second Row */}
           <div className="grid grid-cols-12 gap-4 mb-4">
             {/* Emotion Timeline Breakdown */}
             <div className="col-span-3 bg-white/5 border border-white/10 rounded-xl p-5">
               <h2 className="text-base font-medium mb-4">Emotion Timeline Breakdown</h2>
               <div className="space-y-2">
                 {emotionTimeline.map((item, i) => (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex items-center gap-3"
                   >
                     <div className={`w-3 h-3 rounded-full ${item.color}`} />
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium">{item.emotion}</span>
                         <span className="text-xs text-white/50">{item.duration}</span>
                       </div>
                       <span className="text-xs text-white/40">{item.range}</span>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </div>

             {/* Session Phases */}
             <div className="col-span-3 bg-white/5 border border-white/10 rounded-xl p-5">
               <h2 className="text-base font-medium mb-4">Session Phases</h2>
               <div className="space-y-3">
                 {sessionPhases.map((phase, i) => (
                   <div key={phase.phase} className="flex items-center gap-3">
                     <div className="w-16 text-xs text-white/50">{phase.phase}</div>
                     <div className="flex-1">
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${phase.score}%` }}
                           transition={{ duration: 0.5, delay: i * 0.1 }}
                           className={`h-full rounded-full ${
                             phase.score > 80 ? 'bg-green-500' :
                             phase.score > 60 ? 'bg-blue-500' :
                             phase.score > 40 ? 'bg-yellow-500' :
                             'bg-red-500'
                           }`}
                         />
                       </div>
                     </div>
                     <span className="text-xs text-white/50 w-12">{phase.score}%</span>
                   </div>
                 ))}
               </div>
             </div>

             {/* Emotion Distribution */}
             <div className="col-span-3 bg-white/5 border border-white/10 rounded-xl p-5">
               <h2 className="text-base font-medium mb-4">Emotion Distribution</h2>
               <div className="space-y-3">
                 {emotionDistribution.map((item) => (
                   <div key={item.emotion}>
                     <div className="flex items-center justify-between text-sm mb-1">
                       <span className="text-white/70">{item.emotion}</span>
                       <span className="text-white/50">{item.value}%</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: `${item.value}%` }}
                         transition={{ duration: 0.5, delay: 0.2 }}
                         className={`h-full ${item.color} rounded-full`}
                       />
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Recommendations */}
             <div className="col-span-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10 rounded-xl p-5">
               <h2 className="text-base font-medium mb-3">
                 Recommendations
               </h2>
               <div className="space-y-2">
                 {aiRecommendations.map((rec, i) => (
                   <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                     <span className="text-green-400">•</span>
                     <p>{rec}</p>
                   </div>
                 ))}
               </div>
             </div>
           </div>

          {/* Fourth Row */}
          <div className="grid grid-cols-12 gap-4">
            {/* Audio Emotion Segments */}
            <div className="col-span-6 bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-4">Audio Emotion Segments</h2>
              <div className="space-y-2">
                {audioSegments.map((segment, i) => (
                  <motion.div
                    key={segment.time}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer"
                  >
                   <div className="flex items-center gap-3">
                       <div>
                         <p className="text-sm font-medium">{segment.emotion}</p>
                         <p className="text-xs text-white/50">{segment.duration}</p>
                       </div>
                     </div>
                    <span className="text-sm text-white/50">{segment.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Session Comparison */}
            <div className="col-span-6 bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-4">Session Comparison</h2>
              <div className="space-y-3">
                {sessions.map((session, i) => (
                  <motion.div
                    key={session.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5"
                  >
                    <div>
                      <p className="text-sm font-medium">{session.name}</p>
                      <p className="text-xs text-white/50">{session.date} · {session.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Focus peak: {session.focusPeak}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              session.score > 80 ? 'bg-green-500' :
                              session.score > 60 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${session.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/50">{session.score}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
