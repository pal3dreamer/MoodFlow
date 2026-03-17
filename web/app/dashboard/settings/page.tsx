'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardSidebar from '@/components/DashboardSidebar'

type SettingsState = {
  sessionNameFormat: string
  durationReminder: string
  autoEnd: boolean
  autoInsights: boolean
  trajectoryTracking: boolean
  stressDetection: boolean
  patternAnalysis: boolean
  aiRecommendations: boolean
  audioFormat: string
  audioQuality: string
  microphone: string
  sessionReminders: boolean
  breakReminders: boolean
  weeklyInsights: boolean
  trendSummaries: boolean
  dataStorage: boolean
  anonymizedData: boolean
  theme: string
  graphAnimation: boolean
  reducedMotion: boolean
}

const defaultSettings: SettingsState = {
  sessionNameFormat: 'topic-date',
  durationReminder: '45',
  autoEnd: true,
  autoInsights: true,
  trajectoryTracking: true,
  stressDetection: true,
  patternAnalysis: true,
  aiRecommendations: true,
  audioFormat: 'webm',
  audioQuality: 'high',
  microphone: 'default',
  sessionReminders: true,
  breakReminders: true,
  weeklyInsights: false,
  trendSummaries: true,
  dataStorage: true,
  anonymizedData: false,
  theme: 'dark',
  graphAnimation: true,
  reducedMotion: false,
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-500' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4"
    >
      <h2 className="text-base font-medium mb-4">{title}</h2>
      {children}
    </motion.div>
  )
}

export default function SettingsPage() {
  const [name, setName] = useState('John Doe')
  const [email, setEmail] = useState('john@example.com')
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [initialAccount, setInitialAccount] = useState({ name: 'John Doe', email: 'john@example.com' })
  const [initialSettings, setInitialSettings] = useState<SettingsState>(defaultSettings)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [microphoneMessage, setMicrophoneMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      const [meResponse, settingsResponse] = await Promise.all([
        fetch('/api/me', { cache: 'no-store' }),
        fetch('/api/settings', { cache: 'no-store' }),
      ])

      if (meResponse.status === 401 || settingsResponse.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!meResponse.ok || !settingsResponse.ok) {
        throw new Error('Failed to load settings.')
      }

      const mePayload = await meResponse.json()
      const settingsPayload = await settingsResponse.json()

      const nextAccount = {
        name: mePayload.user?.name ?? 'John Doe',
        email: mePayload.user?.email ?? 'john@example.com',
      }

      const nextSettings: SettingsState = {
        sessionNameFormat: settingsPayload?.sessionNameFormat ?? defaultSettings.sessionNameFormat,
        durationReminder: String(settingsPayload?.durationReminder ?? defaultSettings.durationReminder),
        autoEnd: settingsPayload?.autoEnd ?? defaultSettings.autoEnd,
        autoInsights: settingsPayload?.autoInsights ?? defaultSettings.autoInsights,
        trajectoryTracking: settingsPayload?.trajectoryTracking ?? defaultSettings.trajectoryTracking,
        stressDetection: settingsPayload?.stressDetection ?? defaultSettings.stressDetection,
        patternAnalysis: settingsPayload?.patternAnalysis ?? defaultSettings.patternAnalysis,
        aiRecommendations: settingsPayload?.aiRecommendations ?? defaultSettings.aiRecommendations,
        audioFormat: settingsPayload?.audioFormat ?? defaultSettings.audioFormat,
        audioQuality: settingsPayload?.audioQuality ?? defaultSettings.audioQuality,
        microphone: settingsPayload?.microphone ?? defaultSettings.microphone,
        sessionReminders: settingsPayload?.sessionReminders ?? defaultSettings.sessionReminders,
        breakReminders: settingsPayload?.breakReminders ?? defaultSettings.breakReminders,
        weeklyInsights: settingsPayload?.weeklyInsights ?? defaultSettings.weeklyInsights,
        trendSummaries: settingsPayload?.trendSummaries ?? defaultSettings.trendSummaries,
        dataStorage: settingsPayload?.dataStorage ?? defaultSettings.dataStorage,
        anonymizedData: settingsPayload?.anonymizedData ?? defaultSettings.anonymizedData,
        theme: settingsPayload?.theme ?? defaultSettings.theme,
        graphAnimation: settingsPayload?.graphAnimation ?? defaultSettings.graphAnimation,
        reducedMotion: settingsPayload?.reducedMotion ?? defaultSettings.reducedMotion,
      }

      setName(nextAccount.name)
      setEmail(nextAccount.email)
      setInitialAccount(nextAccount)
      setSettings(nextSettings)
      setInitialSettings(nextSettings)
    }

    setIsLoading(true)
    setError('')
    loadData()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load settings.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  async function handleSave() {
    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      const [meResponse, settingsResponse] = await Promise.all([
        fetch('/api/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        }),
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...settings,
            durationReminder: Number(settings.durationReminder),
          }),
        }),
      ])

      if (meResponse.status === 401 || settingsResponse.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!meResponse.ok || !settingsResponse.ok) {
        const mePayload = await meResponse.json().catch(() => ({}))
        const settingsPayload = await settingsResponse.json().catch(() => ({}))
        throw new Error(mePayload.error || settingsPayload.error || 'Failed to save settings.')
      }

      setInitialAccount({ name, email })
      setInitialSettings(settings)
      setMessage('Settings saved')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleReset() {
    setName(initialAccount.name)
    setEmail(initialAccount.email)
    setSettings(initialSettings)
    setMessage('')
    setError('')
  }

  async function downloadExport(url: string, fileName: string) {
    setError('')
    const response = await fetch(url)

    if (response.status === 401) {
      window.location.href = '/login'
      return
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Export failed' }))
      throw new Error(payload.error || 'Export failed')
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(blobUrl)
  }

  async function handleConfirmedAction() {
    if (!showConfirm) return

    setError('')
    setMessage('')

    const action = showConfirm
    setShowConfirm(null)

    try {
      if (action === 'sessions') {
        const response = await fetch('/api/sessions', { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to clear session history.')
        setMessage('Session history cleared')
      } else if (action === 'recordings') {
        const response = await fetch('/api/recordings', { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to delete recordings.')
        setMessage('All recordings deleted')
      }
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Action failed.')
    }
  }

  async function testMicrophone() {
    setError('')
    setMessage('')
    setMicrophoneMessage('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setMicrophoneMessage('Microphone access is working.')
    } catch (microphoneError) {
      setMicrophoneMessage(
        microphoneError instanceof Error ? microphoneError.message : 'Microphone access was denied.',
      )
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar active="Settings" />

      <main className="flex-1 ml-52 overflow-auto flex justify-center">
        <div className="p-6 w-full max-w-6xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">Settings</h1>
            <p className="text-white/50 text-sm">Manage your account and preferences</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          <Section title="Account">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-semibold">
                  {(name || 'J').slice(0, 1).toUpperCase()}
                </div>
                <button
                  onClick={() => setMessage('Avatar upload is not available yet.')}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                >
                  Avatar Upload Unavailable
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { handleSave().catch(() => undefined) }} disabled={isSaving || isLoading} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleReset} disabled={isSaving || isLoading} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors disabled:opacity-50">
                  Reset
                </button>
              </div>
            </div>
          </Section>

          <Section title="Session Preferences">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Default Session Name Format</label>
                  <select value={settings.sessionNameFormat} onChange={(e) => setSettings((current) => ({ ...current, sessionNameFormat: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30">
                    <option value="topic-date" className="bg-black">Topic + Date</option>
                    <option value="date-topic" className="bg-black">Date + Topic</option>
                    <option value="topic" className="bg-black">Topic Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Duration Reminder (minutes)</label>
                  <select value={settings.durationReminder} onChange={(e) => setSettings((current) => ({ ...current, durationReminder: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30">
                    <option value="30" className="bg-black">30</option>
                    <option value="45" className="bg-black">45</option>
                    <option value="60" className="bg-black">60</option>
                    <option value="90" className="bg-black">90</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Auto-detect Session End</p>
                  <p className="text-xs text-white/40">Automatically end session when inactivity detected</p>
                </div>
                <Toggle enabled={settings.autoEnd} onChange={(value) => setSettings((current) => ({ ...current, autoEnd: value }))} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Auto-generate Insights</p>
                  <p className="text-xs text-white/40">Generate insights after each session</p>
                </div>
                <Toggle enabled={settings.autoInsights} onChange={(value) => setSettings((current) => ({ ...current, autoInsights: value }))} />
              </div>
            </div>
          </Section>

          <Section title="Emotional Analysis">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Emotional Trajectory Tracking</p>
                  <p className="text-xs text-white/40">Track VAD values over time</p>
                </div>
                <Toggle enabled={settings.trajectoryTracking} onChange={(value) => setSettings((current) => ({ ...current, trajectoryTracking: value }))} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Stress Spike Detection</p>
                  <p className="text-xs text-white/40">Alert when stress levels spike</p>
                </div>
                <Toggle enabled={settings.stressDetection} onChange={(value) => setSettings((current) => ({ ...current, stressDetection: value }))} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Productivity Pattern Analysis</p>
                  <p className="text-xs text-white/40">Detect patterns in your work sessions</p>
                </div>
                <Toggle enabled={settings.patternAnalysis} onChange={(value) => setSettings((current) => ({ ...current, patternAnalysis: value }))} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">AI Recommendations</p>
                  <p className="text-xs text-white/40">Receive personalized suggestions</p>
                </div>
                <Toggle enabled={settings.aiRecommendations} onChange={(value) => setSettings((current) => ({ ...current, aiRecommendations: value }))} />
              </div>
            </div>
          </Section>

          <Section title="Audio Recording">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Recording Format</label>
                  <select value={settings.audioFormat} onChange={(e) => setSettings((current) => ({ ...current, audioFormat: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30">
                    <option value="webm" className="bg-black">WEBM</option>
                    <option value="mp3" className="bg-black">MP3</option>
                    <option value="wav" className="bg-black">WAV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Audio Quality</label>
                  <select value={settings.audioQuality} onChange={(e) => setSettings((current) => ({ ...current, audioQuality: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30">
                    <option value="high" className="bg-black">High</option>
                    <option value="medium" className="bg-black">Medium</option>
                    <option value="low" className="bg-black">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Microphone</label>
                <select value={settings.microphone} onChange={(e) => setSettings((current) => ({ ...current, microphone: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30">
                  <option value="default" className="bg-black">Default Microphone</option>
                  <option value="external" className="bg-black">External USB Microphone</option>
                </select>
              </div>
              <button
                onClick={() => { testMicrophone().catch(() => undefined) }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                Test Microphone
              </button>
              {microphoneMessage && <p className="text-sm text-white/60">{microphoneMessage}</p>}
            </div>
          </Section>

          <Section title="Notifications">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Session Reminders</p>
                  <p className="text-xs text-white/40">Remind to start focus sessions</p>
                </div>
                <Toggle enabled={settings.sessionReminders} onChange={(value) => setSettings((current) => ({ ...current, sessionReminders: value }))} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Break Reminders</p>
                  <p className="text-xs text-white/40">Prompt for breaks during long sessions</p>
                </div>
                <Toggle enabled={settings.breakReminders} onChange={(value) => setSettings((current) => ({ ...current, breakReminders: value }))} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Weekly Insights</p>
                  <p className="text-xs text-white/40">Receive weekly productivity summary</p>
                </div>
                <Toggle enabled={settings.weeklyInsights} onChange={(value) => setSettings((current) => ({ ...current, weeklyInsights: value }))} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Emotional Trend Summaries</p>
                  <p className="text-xs text-white/40">Weekly emotional pattern updates</p>
                </div>
                <Toggle enabled={settings.trendSummaries} onChange={(value) => setSettings((current) => ({ ...current, trendSummaries: value }))} />
              </div>
            </div>
          </Section>

          <Section title="Privacy">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Emotional Data Storage</p>
                  <p className="text-xs text-white/40">Store emotional analysis data locally</p>
                </div>
                <Toggle enabled={settings.dataStorage} onChange={(value) => setSettings((current) => ({ ...current, dataStorage: value }))} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Anonymized Model Improvement</p>
                  <p className="text-xs text-white/40">Contribute anonymized data to improve AI</p>
                </div>
                <Toggle enabled={settings.anonymizedData} onChange={(value) => setSettings((current) => ({ ...current, anonymizedData: value }))} />
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">Export Personal Data</p>
                <button onClick={() => { downloadExport('/api/export/personal-data', 'moodflow-personal-data.json').catch((downloadError) => setError(downloadError instanceof Error ? downloadError.message : 'Export failed.')) }} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-colors">
                  Download
                </button>
              </div>
            </div>
          </Section>

          <Section title="Appearance">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Theme</label>
                <select value={settings.theme} onChange={(e) => setSettings((current) => ({ ...current, theme: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30">
                  <option value="dark" className="bg-black">Dark</option>
                  <option value="system" className="bg-black">System</option>
                  <option value="light" className="bg-black">Light</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Graph Animations</p>
                  <p className="text-xs text-white/40">Animate charts and graphs</p>
                </div>
                <Toggle enabled={settings.graphAnimation} onChange={(value) => setSettings((current) => ({ ...current, graphAnimation: value }))} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Reduced Motion</p>
                  <p className="text-xs text-white/40">Minimize UI animations</p>
                </div>
                <Toggle enabled={settings.reducedMotion} onChange={(value) => setSettings((current) => ({ ...current, reducedMotion: value }))} />
              </div>
            </div>
          </Section>

          <Section title="Data Management">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">Export Session Data</p>
                <button onClick={() => { downloadExport('/api/export/sessions', 'moodflow-sessions.json').catch((downloadError) => setError(downloadError instanceof Error ? downloadError.message : 'Export failed.')) }} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-colors">
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">Export Emotional Insights</p>
                <button onClick={() => { downloadExport('/api/export/insights', 'moodflow-insights.json').catch((downloadError) => setError(downloadError instanceof Error ? downloadError.message : 'Export failed.')) }} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-colors">
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-white/10 mt-4 pt-4">
                <div>
                  <p className="text-sm font-medium">Clear Session History</p>
                  <p className="text-xs text-white/40">Delete all past sessions</p>
                </div>
                <button onClick={() => setShowConfirm('sessions')} className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors">
                  Clear
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Delete All Recordings</p>
                  <p className="text-xs text-white/40">Permanently remove all audio recordings</p>
                </div>
                <button onClick={() => setShowConfirm('recordings')} className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </Section>

          <Section title="About">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-white/60">Application Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/60">Analysis Model</span>
                <span>EmotionVAD v2.1</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/60">Build</span>
                <span>2026.03.17</span>
              </div>
              <div className="flex gap-4 pt-3 border-t border-white/10 mt-3">
                <a href="#" className="text-white/60 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">Support</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
          </Section>

          {showConfirm && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-medium mb-2">Confirm Action</h3>
                <p className="text-sm text-white/60 mb-4">
                  Are you sure you want to {showConfirm === 'sessions' ? 'clear your session history' : 'delete all recordings'}? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirm(null)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { handleConfirmedAction().catch(() => undefined) }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
