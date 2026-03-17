'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: '◉', active: true },
  { label: 'Sessions', href: '/dashboard/sessions', icon: '◇' },
  { label: 'Insights', href: '/dashboard/insights', icon: '◈' },
  { label: 'Recordings', href: '/dashboard/recordings', icon: '▸' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
]

const emotionDistribution = [
  { emotion: 'Focused', value: 42, color: 'bg-blue-500' },
  { emotion: 'Calm', value: 28, color: 'bg-green-500' },
  { emotion: 'Stressed', value: 18, color: 'bg-red-500' },
  { emotion: 'Fatigued', value: 12, color: 'bg-yellow-500' },
]

const recentSessions = [
  { title: 'Algorithms Study', duration: '1h 40m', startEmotion: 'Calm', endEmotion: 'Focused', time: '2 hours ago' },
  { title: 'Math Problem Set', duration: '45m', startEmotion: 'Focused', endEmotion: 'Stressed', time: '5 hours ago' },
  { title: 'Reading Review', duration: '30m', startEmotion: 'Calm', endEmotion: 'Calm', time: 'Yesterday' },
]

const weeklyTrends = [
  { day: 'Mon', focus: 78, stress: 22 },
  { day: 'Tue', focus: 85, stress: 15 },
  { day: 'Wed', focus: 65, stress: 45 },
  { day: 'Thu', focus: 72, stress: 28 },
  { day: 'Fri', focus: 88, stress: 12 },
  { day: 'Sat', focus: 55, stress: 35 },
  { day: 'Sun', focus: 70, stress: 20 },
]

const insights = [
  { type: 'stress', text: 'Stressed after 45 min', icon: '⚡' },
  { type: 'productivity', text: 'Best: 20–40 min sessions', icon: '◎' },
  { type: 'pattern', text: 'Focus best Tue/Fri AM', icon: '◇' },
]

export default function Dashboard() {
  const [sessionActive, setSessionActive] = useState(false)

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
                <span className="w-4 text-center text-xs">{link.icon}</span>
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
      <main className="flex-1 ml-52">
        <div className="p-6 w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold mb-0.5">How are you feeling?</h1>
              <p className="text-white/50 text-sm">Track your emotional well-being during work</p>
            </div>
            <button
              onClick={() => setSessionActive(!sessionActive)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                sessionActive
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${sessionActive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              {sessionActive ? 'End Session' : 'Start Session'}
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Sessions Today', value: '3', sub: '+1 from yesterday' },
              { label: 'Focus Time', value: '4h 25m', sub: '+1h 15m today' },
              { label: 'Avg. Session', value: '52m', sub: 'Based on 12' },
              { label: 'Current Mood', value: 'Focused', sub: 'Last: 10 min ago', color: 'text-blue-400' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className={`text-3xl font-semibold ${stat.color || 'text-white'}`}>{stat.value}</p>
                <p className="text-white/30 text-xs mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-4">
            {/* Stats */}
            
            {/* Emotion Timeline - 8 columns */}
            <div className="col-span-8 bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium">Emotion Timeline</h2>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Calm</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Focused</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Stressed</span>
                </div>
              </div>
              
              <div className="relative h-32 mb-3">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1="0" y1={i * 25} x2="400" y2={i * 25} stroke="white/5" strokeWidth="1" />
                  ))}
                  <path
                    d="M 0,30 L 57,20 L 114,25 L 171,50 L 228,75 L 285,80 L 400,40"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0,30 L 57,20 L 114,25 L 171,50 L 228,75 L 285,80 L 400,40 L 400,100 L 0,100 Z"
                    fill="url(#curveFill)"
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                    <linearGradient id="curveFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/30 px-1">
                  <span>9:00</span>
                  <span>10:00</span>
                  <span>11:00</span>
                  <span>12:00</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                <span>⚡</span>
                <span>Stress spike at 10:30 AM (45 min mark)</span>
              </div>
            </div>

            {/* Right Column - 4 columns */}
            <div className="col-span-4 space-y-4">
              {/* Emotion Distribution */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
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

              {/* Focus Stability & Consistency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h2 className="text-sm font-medium mb-3">Focus Stability</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white/10" strokeWidth="3" />
                        <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" initial={{ strokeDasharray: '0, 100' }} animate={{ strokeDasharray: '78, 100' }} transition={{ duration: 1, delay: 0.5 }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">78%</span>
                    </div>
                    <span className="text-xs text-white/50">Stable</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h2 className="text-sm font-medium mb-3">Consistency</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white/10" strokeWidth="3" />
                        <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" initial={{ strokeDasharray: '0, 100' }} animate={{ strokeDasharray: '82, 100' }} transition={{ duration: 1, delay: 0.7 }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">82%</span>
                    </div>
                    <span className="text-xs text-white/50">Consistent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-12 gap-4 mt-4">
            {/* Weekly Trends - 4 columns */}
            <div className="col-span-4 bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-4">Weekly Focus</h2>
              <div className="flex items-end justify-between h-24 gap-2">
                {weeklyTrends.map((day, i) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-px">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${day.focus * 0.7}px` }} transition={{ duration: 0.4, delay: i * 0.05 }} className="w-full bg-blue-500/60 rounded-t-sm" />
                      <motion.div initial={{ height: 0 }} animate={{ height: `${day.stress * 0.7}px` }} transition={{ duration: 0.4, delay: i * 0.05 + 0.1 }} className="w-full bg-red-500/40 rounded-t-sm" />
                    </div>
                    <span className="text-xs text-white/40">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/60" /> Focus</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/40" /> Stress</span>
              </div>
            </div>

            {/* Recent Sessions - 5 columns */}
            <div className="col-span-5 bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium">Recent Sessions</h2>
                <button className="text-sm text-white/50 hover:text-white">View all</button>
              </div>
              <div className="space-y-2">
                {recentSessions.map((session, i) => (
                  <motion.div
                    key={session.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5"
                  >
                    <div>
                      <p className="text-sm font-medium">{session.title}</p>
                      <p className="text-xs text-white/50">{session.duration} · {session.time}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">{session.startEmotion}</span>
                      <span className="text-white/30">→</span>
                      <span className={`px-2 py-1 rounded ${
                        session.endEmotion === 'Focused' ? 'bg-blue-500/20 text-blue-400' :
                        session.endEmotion === 'Stressed' ? 'bg-red-500/20 text-red-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>{session.endEmotion}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Insights - 3 columns */}
            <div className="col-span-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-3 flex items-center gap-2">
                <span>◇</span> AI Insights
              </h2>
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-lg">{insight.icon}</span>
                    <p>{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
