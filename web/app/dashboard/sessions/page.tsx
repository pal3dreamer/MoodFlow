'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardSidebar from '@/components/DashboardSidebar'

const emotions = ['All', 'Calm', 'Focused', 'Stressed', 'Fatigued']
const durations = ['All', 'Under 30m', '30-60m', '60-90m', 'Over 90m']

type SessionItem = {
  id: string
  title: string
  durationMinutes: number
  durationLabel: string
  date: string
  time: string
  startEmotion: string
  endEmotion: string
  insight: string
  score: number
}

function formatDuration(durationSeconds: number) {
  const totalMinutes = Math.max(0, Math.round(durationSeconds / 60))
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  return `${totalMinutes}m`
}

function getEmotionColor(emotion: string) {
  switch (emotion) {
    case 'Calm':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'Focused':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'Stressed':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'Fatigued':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    default:
      return 'bg-white/10 text-white/60 border-white/20'
  }
}

function matchesDuration(durationMinutes: number, filter: string) {
  if (filter === 'Under 30m') return durationMinutes < 30
  if (filter === '30-60m') return durationMinutes >= 30 && durationMinutes <= 60
  if (filter === '60-90m') return durationMinutes > 60 && durationMinutes <= 90
  if (filter === 'Over 90m') return durationMinutes > 90
  return true
}

export default function SessionsPage() {
  const [search, setSearch] = useState('')
  const [emotionFilter, setEmotionFilter] = useState('All')
  const [durationFilter, setDurationFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const sessionsPerPage = 5

  async function loadSessions() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (emotionFilter !== 'All') params.set('emotion', emotionFilter)
    params.set('sort', sortBy)
    params.set('page', '1')
    params.set('pageSize', '100')

    const response = await fetch(`/api/sessions?${params.toString()}`, {
      cache: 'no-store',
    })

    if (response.status === 401) {
      window.location.href = '/login'
      return
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Failed to load sessions' }))
      throw new Error(payload.error || 'Failed to load sessions')
    }

    const payload = await response.json()
    const mapped = (payload.items ?? []).map((item: any) => {
      const startedAt = new Date(item.startedAt)
      const durationMinutes = Math.max(0, Math.round((item.durationSeconds ?? 0) / 60))
      return {
        id: item.id,
        title: item.title,
        durationMinutes,
        durationLabel: formatDuration(item.durationSeconds ?? 0),
        date: startedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: startedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        startEmotion: item.startEmotion ?? 'Calm',
        endEmotion: item.endEmotion ?? item.dominantEmotion ?? 'Focused',
        insight: item.summaryInsight ?? 'No summary insight yet',
        score: item.score ?? 0,
      } satisfies SessionItem
    })

    setSessions(mapped)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [search, emotionFilter, durationFilter, sortBy])

  useEffect(() => {
    setIsLoading(true)
    setError('')
    loadSessions()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load sessions')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [search, emotionFilter, sortBy])

  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => matchesDuration(session.durationMinutes, durationFilter))
      .sort((a, b) => {
        if (sortBy === 'highest') return b.score - a.score
        if (sortBy === 'longest') return b.durationMinutes - a.durationMinutes
        return 0
      })
  }, [durationFilter, sessions, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / sessionsPerPage))
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * sessionsPerPage, currentPage * sessionsPerPage)

  const totalSessions = filteredSessions.length
  const totalFocusTime = filteredSessions.reduce((acc, session) => acc + session.durationMinutes, 0)
  const avgDuration = totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0
  const mostCommonEmotion = filteredSessions.length > 0
    ? Object.entries(
        filteredSessions.reduce<Record<string, number>>((acc, session) => {
          acc[session.endEmotion] = (acc[session.endEmotion] ?? 0) + 1
          return acc
        }, {}),
      ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None'
    : 'None'

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar active="Sessions" />

      <main className="flex-1 ml-52 overflow-auto flex justify-center">
        <div className="p-6 w-full max-w-6xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">Sessions</h1>
            <p className="text-white/50 text-sm">View and manage your recorded work sessions</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Sessions', value: totalSessions },
              { label: 'Total Focus Time', value: `${Math.round(totalFocusTime / 60)}h` },
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
                <p className="text-2xl font-semibold">{isLoading ? '...' : stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
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

              <select
                value={emotionFilter}
                onChange={(e) => setEmotionFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
              >
                {emotions.map((emotion) => (
                  <option key={emotion} value={emotion} className="bg-black">{emotion}</option>
                ))}
              </select>

              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
              >
                {durations.map((duration) => (
                  <option key={duration} value={duration} className="bg-black">{duration}</option>
                ))}
              </select>
            </div>

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

          <div className="space-y-3 mb-6">
            {!isLoading && paginatedSessions.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-white/35">
                No sessions match the current filters.
              </div>
            )}

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
                      <span className="text-white/60">{session.durationLabel}</span>
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
                            session.score > 80 ? 'bg-green-500' : session.score > 60 ? 'bg-blue-500' : 'bg-yellow-500'
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

          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">
              Showing {filteredSessions.length === 0 ? 0 : ((currentPage - 1) * sessionsPerPage) + 1} to {Math.min(currentPage * sessionsPerPage, filteredSessions.length)} of {filteredSessions.length} sessions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    currentPage === page ? 'bg-white text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
