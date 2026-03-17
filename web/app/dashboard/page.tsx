'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import VoiceCheckModal from '@/components/VoiceCheckModal'
import DashboardSidebar from '@/components/DashboardSidebar'

type DashboardSession = {
  id: string
  title: string
  topic: string | null
  startedAt: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
}

type DashboardPayload = {
  activeSession: DashboardSession | null
  stats: {
    sessionsToday: number
    focusTime: string
    avgSession: string
    currentMood: string | null
  }
  recentSessions: Array<{
    title: string
    duration: string
    startEmotion: string
    endEmotion: string
    time: string
  }>
  weeklyTrends: Array<{
    day: string
    focus: number
    stress: number
  }>
  emotionDistribution: Array<{
    emotion: string
    value: number
  }>
  insights: Array<{
    type: string
    text: string
  }>
  timeline: Array<{
    time: string
    calm: number
    focus: number
    stress: number
  }>
  stressInsight: string | null
}

const emptyDashboard: DashboardPayload = {
  activeSession: null,
  stats: {
    sessionsToday: 0,
    focusTime: '0m',
    avgSession: '0m',
    currentMood: null,
  },
  recentSessions: [],
  weeklyTrends: [
    { day: 'Mon', focus: 0, stress: 0 },
    { day: 'Tue', focus: 0, stress: 0 },
    { day: 'Wed', focus: 0, stress: 0 },
    { day: 'Thu', focus: 0, stress: 0 },
    { day: 'Fri', focus: 0, stress: 0 },
    { day: 'Sat', focus: 0, stress: 0 },
    { day: 'Sun', focus: 0, stress: 0 },
  ],
  emotionDistribution: [],
  insights: [],
  timeline: [],
  stressInsight: null,
}

const emotionColorMap: Record<string, string> = {
  Calm: 'bg-green-500/20 text-green-400',
  Focused: 'bg-blue-500/20 text-blue-400',
  Stressed: 'bg-red-500/20 text-red-400',
  Fatigued: 'bg-yellow-500/20 text-yellow-400',
}

function buildLinePath(values: number[], width: number, height: number) {
  if (values.length === 0) {
    return ''
  }

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width
      const y = height - (Math.min(Math.max(value, 0), 100) / 100) * height
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`
    })
    .join(' ')
}

function buildAreaPath(values: number[], width: number, height: number) {
  if (values.length === 0) {
    return ''
  }

  const line = buildLinePath(values, width, height)
  return `${line} L ${width},${height} L 0,${height} Z`
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardPayload>(emptyDashboard)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalMode, setModalMode] = useState<'start' | 'end' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function loadDashboard() {
    setError('')
    const response = await fetch('/api/dashboard', {
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      throw new Error('Failed to load dashboard data.')
    }

    const payload = await response.json()
    setDashboard({
      ...emptyDashboard,
      ...payload,
      weeklyTrends: payload.weeklyTrends?.length ? payload.weeklyTrends : emptyDashboard.weeklyTrends,
    })
  }

  useEffect(() => {
    setIsLoading(true)
    loadDashboard()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard data.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  async function handleStartSession(payload: { title?: string; topic?: string; file: File }) {
    setIsSubmitting(true)
    setSubmitError('')

    let createdSessionId: string | null = null

    try {
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload.title,
          topic: payload.topic,
        }),
      })

      const sessionResult = await sessionResponse.json().catch(() => ({}))
      if (!sessionResponse.ok) {
        throw new Error(sessionResult.error || 'Failed to start session.')
      }

      createdSessionId = sessionResult.id

      const formData = new FormData()
      formData.set('file', payload.file)
      if (createdSessionId) {
        formData.set('focusSessionId', createdSessionId)
      }

      const recordingResponse = await fetch('/api/recordings/checkin', {
        method: 'POST',
        body: formData,
      })

      const recordingResult = await recordingResponse.json().catch(() => ({}))
      if (!recordingResponse.ok) {
        throw new Error(recordingResult.error || 'Failed to upload check-in.')
      }

      await loadDashboard()
      setModalMode(null)
    } catch (submissionError) {
      if (createdSessionId) {
        await fetch(`/api/sessions/${createdSessionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'cancelled' }),
        }).catch(() => undefined)
      }

      setSubmitError(submissionError instanceof Error ? submissionError.message : 'Failed to start session.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEndSession(payload: { file: File }) {
    if (!dashboard.activeSession) {
      setSubmitError('No active session found.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const formData = new FormData()
      formData.set('file', payload.file)
      formData.set('focusSessionId', dashboard.activeSession.id)

      const recordingResponse = await fetch('/api/recordings/checkin', {
        method: 'POST',
        body: formData,
      })

      const recordingResult = await recordingResponse.json().catch(() => ({}))
      if (!recordingResponse.ok) {
        throw new Error(recordingResult.error || 'Failed to upload checkout.')
      }

      const sessionResponse = await fetch(`/api/sessions/${dashboard.activeSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      })

      const sessionResult = await sessionResponse.json().catch(() => ({}))
      if (!sessionResponse.ok) {
        throw new Error(sessionResult.error || 'Failed to end session.')
      }

      await loadDashboard()
      setModalMode(null)
    } catch (submissionError) {
      setSubmitError(submissionError instanceof Error ? submissionError.message : 'Failed to end session.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const timelineWidth = 400
  const timelineHeight = 100
  const calmValues = dashboard.timeline.map((point) => point.calm)
  const focusValues = dashboard.timeline.map((point) => point.focus)
  const stressValues = dashboard.timeline.map((point) => point.stress)
  const focusArea = buildAreaPath(focusValues, timelineWidth, timelineHeight)

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar active="Dashboard" />

      <main className="flex-1 ml-52 overflow-auto flex justify-center">
        <div className="p-6 w-full max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold mb-0.5">How are you feeling?</h1>
              <p className="text-white/50 text-sm">Track your emotional well-being during work</p>
              {dashboard.activeSession && (
                <p className="mt-2 text-xs text-green-400">
                  Active session: {dashboard.activeSession.title}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setSubmitError('')
                setModalMode(dashboard.activeSession ? 'end' : 'start')
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                dashboard.activeSession
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dashboard.activeSession ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              {dashboard.activeSession ? 'End Session' : 'Start Session'}
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Sessions Today', value: String(dashboard.stats.sessionsToday), sub: dashboard.stats.sessionsToday > 0 ? 'Tracked from live data' : 'Start your first session' },
              { label: 'Focus Time', value: dashboard.stats.focusTime, sub: dashboard.stats.focusTime !== '0m' ? 'Based on completed sessions' : 'No focus time recorded yet' },
              { label: 'Avg. Session', value: dashboard.stats.avgSession, sub: dashboard.recentSessions.length > 0 ? `Based on ${dashboard.recentSessions.length}+ sessions` : 'Waiting for session history' },
              { label: 'Current Mood', value: dashboard.stats.currentMood ?? 'No Data', sub: dashboard.stats.currentMood ? 'From latest analyzed check-in' : 'Record a check-in to see this', color: 'text-blue-400' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className={`text-3xl font-semibold ${stat.color || 'text-white'}`}>{isLoading ? '...' : stat.value}</p>
                <p className="text-white/30 text-xs mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-4">
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
                {dashboard.timeline.length > 0 ? (
                  <svg className="w-full h-full" viewBox={`0 0 ${timelineWidth} ${timelineHeight}`} preserveAspectRatio="none">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <line key={index} x1="0" y1={index * 25} x2={timelineWidth} y2={index * 25} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    ))}
                    <path d={buildLinePath(calmValues, timelineWidth, timelineHeight)} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={buildLinePath(focusValues, timelineWidth, timelineHeight)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={buildLinePath(stressValues, timelineWidth, timelineHeight)} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    {focusArea && <path d={focusArea} fill="url(#focusFill)" opacity="0.22" />}
                    <defs>
                      <linearGradient id="focusFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/35">
                    Complete a voice check-in to start generating an emotion timeline.
                  </div>
                )}

                {dashboard.timeline.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/30 px-1">
                    {dashboard.timeline.map((point, index) => (
                      <span key={`${point.time}-${index}`}>{point.time}m</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                <span>{dashboard.stressInsight ?? 'No stress spike detected yet.'}</span>
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h2 className="text-base font-medium mb-4">Emotion Distribution</h2>
                <div className="space-y-3">
                  {dashboard.emotionDistribution.length > 0 ? (
                    dashboard.emotionDistribution.map((item) => (
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
                            className={`h-full rounded-full ${
                              item.emotion === 'Calm'
                                ? 'bg-green-500'
                                : item.emotion === 'Stressed'
                                  ? 'bg-red-500'
                                  : item.emotion === 'Focused'
                                    ? 'bg-blue-500'
                                    : 'bg-yellow-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/35">No emotion distribution yet. Start a session and record your check-in.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h2 className="text-sm font-medium mb-3">Focus Stability</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white/10" strokeWidth="3" />
                        <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" initial={{ strokeDasharray: '0, 100' }} animate={{ strokeDasharray: `${dashboard.timeline.length > 0 ? 78 : 0}, 100` }} transition={{ duration: 1, delay: 0.2 }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{dashboard.timeline.length > 0 ? '78%' : '--'}</span>
                    </div>
                    <span className="text-xs text-white/50">{dashboard.timeline.length > 0 ? 'Stable' : 'Pending'}</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h2 className="text-sm font-medium mb-3">Consistency</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white/10" strokeWidth="3" />
                        <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" initial={{ strokeDasharray: '0, 100' }} animate={{ strokeDasharray: `${dashboard.recentSessions.length > 0 ? 82 : 0}, 100` }} transition={{ duration: 1, delay: 0.4 }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{dashboard.recentSessions.length > 0 ? '82%' : '--'}</span>
                    </div>
                    <span className="text-xs text-white/50">{dashboard.recentSessions.length > 0 ? 'Consistent' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mt-4">
            <div className="col-span-4 bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-4">Weekly Focus</h2>
              <div className="flex items-end justify-between h-24 gap-2">
                {dashboard.weeklyTrends.map((day, index) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-px">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${day.focus * 0.7}px` }} transition={{ duration: 0.4, delay: index * 0.05 }} className="w-full bg-blue-500/60 rounded-t-sm" />
                      <motion.div initial={{ height: 0 }} animate={{ height: `${day.stress * 0.7}px` }} transition={{ duration: 0.4, delay: index * 0.05 + 0.1 }} className="w-full bg-red-500/40 rounded-t-sm" />
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

            <div className="col-span-5 bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium">Recent Sessions</h2>
                <Link href="/dashboard/sessions" className="text-sm text-white/50 hover:text-white">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {dashboard.recentSessions.length > 0 ? (
                  dashboard.recentSessions.map((session, index) => (
                    <motion.div
                      key={`${session.title}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5"
                    >
                      <div>
                        <p className="text-sm font-medium">{session.title}</p>
                        <p className="text-xs text-white/50">{session.duration} · {session.time}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded ${emotionColorMap[session.startEmotion] ?? 'bg-white/10 text-white/60'}`}>
                          {session.startEmotion}
                        </span>
                        <span className="text-white/30">→</span>
                        <span className={`px-2 py-1 rounded ${emotionColorMap[session.endEmotion] ?? 'bg-white/10 text-white/60'}`}>
                          {session.endEmotion}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/35">
                    No recent sessions yet. Start a session and complete a voice check-in to populate this list.
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-3">AI Insights</h2>
              <div className="space-y-3">
                {dashboard.insights.length > 0 ? (
                  dashboard.insights.map((insight, index) => (
                    <div key={`${insight.type}-${index}`} className="flex items-start gap-2 text-sm text-white/70">
                      <p>{insight.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/45">AI insights will appear after your first analyzed check-in.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <VoiceCheckModal
        mode="start"
        open={modalMode === 'start'}
        loading={isSubmitting}
        error={submitError}
        onClose={() => {
          if (!isSubmitting) {
            setModalMode(null)
            setSubmitError('')
          }
        }}
        onSubmit={async (payload) => {
          await handleStartSession(payload)
        }}
      />

      <VoiceCheckModal
        mode="end"
        open={modalMode === 'end'}
        sessionTitle={dashboard.activeSession?.title}
        loading={isSubmitting}
        error={submitError}
        onClose={() => {
          if (!isSubmitting) {
            setModalMode(null)
            setSubmitError('')
          }
        }}
        onSubmit={async (payload) => {
          await handleEndSession({ file: payload.file })
        }}
      />
    </div>
  )
}
