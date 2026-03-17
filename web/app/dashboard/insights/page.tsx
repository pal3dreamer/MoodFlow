'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardSidebar from '@/components/DashboardSidebar'

type InsightsPayload = {
  vadData: Array<{ time: string; valence: number; arousal: number; dominance: number }>
  emotionTimeline: Array<{ range: string; emotion: string; duration: string; color: string }>
  sessionPhases: Array<{ phase: string; duration: string; dominant: string; score: number }>
  weeklyData: Array<{ day: string; emotion: string; focus: number; stress: number }>
  emotionDistribution: Array<{ emotion: string; value: number }>
  audioSegments: Array<{ time: string; emotion: string; duration: string }>
  aiInsights: string[]
  aiRecommendations: string[]
  sessions: Array<{ name: string; date: string; duration: string; focusPeak: string; score: number }>
  focusStability: number
  emotionalConsistency: number
}

const emptyData: InsightsPayload = {
  vadData: [],
  emotionTimeline: [],
  sessionPhases: [],
  weeklyData: [],
  emotionDistribution: [],
  audioSegments: [],
  aiInsights: [],
  aiRecommendations: [],
  sessions: [],
  focusStability: 0,
  emotionalConsistency: 0,
}

function buildLinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return ''
  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width
      const y = height - (Math.min(Math.max(value, 0), 100) / 100) * height
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`
    })
    .join(' ')
}

export default function InsightsPage() {
  const [selectedTab, setSelectedTab] = useState('Analysis')
  const [data, setData] = useState<InsightsPayload>(emptyData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInsights() {
      const response = await fetch('/api/insights', { cache: 'no-store' })

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to load insights' }))
        throw new Error(payload.error || 'Failed to load insights')
      }

      const payload = await response.json()
      setData({ ...emptyData, ...payload })
    }

    setIsLoading(true)
    setError('')
    loadInsights()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load insights')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const lineWidth = 500
  const lineHeight = 100
  const valenceValues = data.vadData.map((point) => point.valence)
  const arousalValues = data.vadData.map((point) => point.arousal)
  const dominanceValues = data.vadData.map((point) => point.dominance)

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar active="Insights" />

      <main className="flex-1 ml-52 overflow-auto flex justify-center">
        <div className="p-6 w-full max-w-6xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">Insights</h1>
            <p className="text-white/50 text-sm">AI-powered emotional analysis and behavioral patterns</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            {['Analysis', 'Sessions', 'Trends', 'Audio'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === tab ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

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
                {data.vadData.length > 0 ? (
                  <svg className="w-full h-full" viewBox={`0 0 ${lineWidth} ${lineHeight}`} preserveAspectRatio="none">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <line key={index} x1="0" y1={index * 25} x2={lineWidth} y2={index * 25} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    ))}
                    <path d={buildLinePath(valenceValues, lineWidth, lineHeight)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                    <path d={buildLinePath(arousalValues, lineWidth, lineHeight)} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                    <path d={buildLinePath(dominanceValues, lineWidth, lineHeight)} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/35">
                    No analyzed session data yet. Complete a session check-in to see insights.
                  </div>
                )}

                {data.vadData.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/30 px-1">
                    {data.vadData.map((point) => (
                      <span key={point.time}>{point.time} min</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs">
                {data.aiInsights.slice(0, 3).map((insight, index) => (
                  <div
                    key={insight}
                    className={`flex items-center gap-1 ${index === 0 ? 'text-red-400' : index === 1 ? 'text-blue-400' : 'text-yellow-400'}`}
                  >
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-3 flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-medium">Focus Stability</h2>
                  <span className="text-2xl font-semibold text-green-400">
                    {isLoading ? '--' : `${data.focusStability}%`}
                  </span>
                </div>
                <p className="text-xs text-white/50">Low variance indicates stable focus throughout sessions</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-medium">Emotional Consistency</h2>
                  <span className="text-2xl font-semibold text-blue-400">
                    {isLoading ? '--' : `${data.emotionalConsistency}%`}
                  </span>
                </div>
                <p className="text-xs text-white/50">Your emotional patterns are predictable and stable</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3 bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-4">Emotion Timeline Breakdown</h2>
              <div className="space-y-2">
                {data.emotionTimeline.length > 0 ? data.emotionTimeline.map((item, i) => (
                  <motion.div
                    key={`${item.range}-${i}`}
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
                )) : <p className="text-sm text-white/35">Timeline breakdown appears after audio analysis.</p>}
              </div>
            </div>

            <div className="col-span-3 bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-4">Session Phases</h2>
              <div className="space-y-3">
                {data.sessionPhases.length > 0 ? data.sessionPhases.map((phase, i) => (
                  <div key={phase.phase} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-white/50">{phase.phase}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${phase.score}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className={`h-full rounded-full ${
                            phase.score > 80 ? 'bg-green-500' : phase.score > 60 ? 'bg-blue-500' : phase.score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-white/50 w-12">{phase.score}%</span>
                  </div>
                )) : <p className="text-sm text-white/35">No phase breakdown yet.</p>}
              </div>
            </div>

            <div className="col-span-3 bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-4">Emotion Distribution</h2>
              <div className="space-y-3">
                {data.emotionDistribution.length > 0 ? data.emotionDistribution.map((item) => (
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
                          item.emotion === 'Calm' ? 'bg-green-500' : item.emotion === 'Stressed' ? 'bg-red-500' : item.emotion === 'Focused' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                      />
                    </div>
                  </div>
                )) : <p className="text-sm text-white/35">No distribution yet.</p>}
              </div>
            </div>

            <div className="col-span-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-3">Recommendations</h2>
              <div className="space-y-2">
                {data.aiRecommendations.length > 0 ? data.aiRecommendations.map((recommendation) => (
                  <div key={recommendation} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-green-400">•</span>
                    <p>{recommendation}</p>
                  </div>
                )) : <p className="text-sm text-white/40">Recommendations appear after your first analyzed session.</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6 bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-4">Audio Emotion Segments</h2>
              <div className="space-y-2">
                {data.audioSegments.length > 0 ? data.audioSegments.map((segment, i) => (
                  <motion.div
                    key={`${segment.time}-${i}`}
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
                )) : <p className="text-sm text-white/35">No audio segments available yet.</p>}
              </div>
            </div>

            <div className="col-span-6 bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-medium mb-4">Session Comparison</h2>
              <div className="space-y-3">
                {data.sessions.length > 0 ? data.sessions.map((session, i) => (
                  <motion.div
                    key={`${session.name}-${i}`}
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
                              session.score > 80 ? 'bg-green-500' : session.score > 60 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${session.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/50">{session.score}%</span>
                      </div>
                    </div>
                  </motion.div>
                )) : <p className="text-sm text-white/35">No session comparisons available yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
