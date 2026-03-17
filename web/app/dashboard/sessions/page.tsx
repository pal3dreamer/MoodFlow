'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: '◉', active: false },
  { label: 'Sessions', href: '/dashboard/sessions', icon: '◇', active: true },
  { label: 'Insights', href: '/dashboard/insights', icon: '◈', active: false },
  { label: 'Recordings', href: '/dashboard/recordings', icon: '▸', active: false },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙', active: false },
]

const sessions = [
  { id: 1, title: 'Algorithms Study', duration: '1h 40m', date: 'Today', time: '2:30 PM', startEmotion: 'Calm', endEmotion: 'Focused', insight: 'Focus peaked at 25 minutes', score: 82 },
  { id: 2, title: 'Math Problem Set', duration: '45m', date: 'Today', time: '10:00 AM', startEmotion: 'Focused', endEmotion: 'Stressed', insight: 'Stress increased after 30 min', score: 65 },
  { id: 3, title: 'Reading Review', duration: '30m', date: 'Yesterday', time: '4:00 PM', startEmotion: 'Calm', endEmotion: 'Calm', insight: 'Consistent calm throughout', score: 91 },
  { id: 4, title: 'Lab Report Writing', duration: '2h 15m', date: 'Yesterday', time: '9:00 AM', startEmotion: 'Focused', endEmotion: 'Fatigued', insight: 'Fatigue after 90 minutes', score: 48 },
  { id: 5, title: 'Physics Lecture', duration: '1h 30m', date: '2 days ago', time: '11:00 AM', startEmotion: 'Calm', endEmotion: 'Focused', insight: 'Steady engagement', score: 78 },
  { id: 6, title: 'Chemistry Notes', duration: '55m', date: '2 days ago', time: '3:00 PM', startEmotion: 'Focused', endEmotion: 'Focused', insight: 'High concentration throughout', score: 85 },
  { id: 7, title: 'Essay Drafting', duration: '1h 20m', date: '3 days ago', time: '1:00 PM', startEmotion: 'Stressed', endEmotion: 'Calm', insight: 'Stress reduced after break', score: 72 },
  { id: 8, title: 'Data Structures', duration: '2h', date: '3 days ago', time: '10:00 AM', startEmotion: 'Focused', endEmotion: 'Stressed', insight: 'Difficult section at 45 min', score: 55 },
  { id: 9, title: 'Biology Quiz Prep', duration: '40m', date: '4 days ago', time: '5:00 PM', startEmotion: 'Calm', endEmotion: 'Focused', insight: 'Productive last 15 minutes', score: 80 },
  { id: 10, title: 'Literature Review', duration: '1h 10m', date: '4 days ago', time: '9:00 AM', startEmotion: 'Focused', endEmotion: 'Fatigued', insight: 'Energy drop after 50 min', score: 62 },
]

const emotions = ['All', 'Calm', 'Focused', 'Stressed', 'Fatigued']
const durations = ['All', 'Under 30m', '30-60m', '60-90m', 'Over 90m']

export default function Sessions() {
  const [search, setSearch] = useState('')
  const [emotionFilter, setEmotionFilter] = useState('All')
  const [durationFilter, setDurationFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const sessionsPerPage = 5

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(search.toLowerCase())
    const matchesEmotion = emotionFilter === 'All' || session.startEmotion === emotionFilter || session.endEmotion === emotionFilter
    let matchesDuration = true
    if (durationFilter === 'Under 30m') matchesDuration = parseInt(session.duration) < 30
    else if (durationFilter === '30-60m') matchesDuration = parseInt(session.duration) >= 30 && parseInt(session.duration) <= 60
    else if (durationFilter === '60-90m') matchesDuration = parseInt(session.duration) > 60 && parseInt(session.duration) <= 90
    else if (durationFilter === 'Over 90m') matchesDuration = parseInt(session.duration) > 90
    return matchesSearch && matchesEmotion && matchesDuration
  }).sort((a, b) => {
    if (sortBy === 'newest') return 0
    if (sortBy === 'oldest') return 1
    if (sortBy === 'longest') return parseInt(b.duration) - parseInt(a.duration)
    if (sortBy === 'highest') return b.score - a.score
    return 0
  })

  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage)
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * sessionsPerPage, currentPage * sessionsPerPage)

  const totalSessions = sessions.length
  const totalFocusTime = sessions.reduce((acc, s) => acc + parseInt(s.duration), 0)
  const avgDuration = Math.round(totalFocusTime / totalSessions)
  const mostCommonEmotion = 'Focused'

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'Calm': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Focused': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Stressed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Fatigued': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-white/10 text-white/60 border-white/20'
    }
  }

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
      <main className="flex-1 ml-52 overflow-auto">
        <div className="p-6 w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">Sessions</h1>
            <p className="text-white/50 text-sm">View and manage your recorded work sessions</p>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Sessions', value: totalSessions },
              { label: 'Total Focus Time', value: `${totalFocusTime}h` },
              { label: 'Avg Duration', value: `${avgDuration}m` },
              { label: 'Top Emotion', value: mostCommonEmotion },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Emotion Filter */}
              <select
                value={emotionFilter}
                onChange={(e) => setEmotionFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
              >
                {emotions.map(e => <option key={e} value={e} className="bg-black">{e}</option>)}
              </select>

              {/* Duration Filter */}
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
              >
                {durations.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option value="newest" className="bg-black">Newest First</option>
              <option value="oldest" className="bg-black">Oldest First</option>
              <option value="longest" className="bg-black">Longest Duration</option>
              <option value="highest" className="bg-black">Highest Score</option>
            </select>
          </div>

          {/* Sessions List */}
          <div className="space-y-3 mb-6">
            {paginatedSessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-medium">{session.title}</h3>
                      <span className="text-xs text-white/40">{session.date} at {session.time}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white/60">{session.duration}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded border text-xs ${getEmotionColor(session.startEmotion)}`}>
                          {session.startEmotion}
                        </span>
                        <span className="text-white/30">→</span>
                        <span className={`px-2 py-0.5 rounded border text-xs ${getEmotionColor(session.endEmotion)}`}>
                          {session.endEmotion}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
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
                      <span className="text-sm text-white/60">{session.score}%</span>
                    </div>
                    <p className="text-xs text-white/40">{session.insight}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">
              Showing {((currentPage - 1) * sessionsPerPage) + 1} to {Math.min(currentPage * sessionsPerPage, filteredSessions.length)} of {filteredSessions.length} sessions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    currentPage === page
                      ? 'bg-white text-black'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
