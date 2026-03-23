'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardSidebar from '@/components/DashboardSidebar'

type SettingsState = {
  sessionNameFormat: string
  durationReminder: string
  audioFormat: string
  audioQuality: string
  microphone: string
  dataStorage: boolean
  anonymizedData: boolean
}

const defaultSettings: SettingsState = {
  sessionNameFormat: 'topic-date',
  durationReminder: '45',
  audioFormat: 'webm',
  audioQuality: 'high',
  microphone: 'default',
  dataStorage: true,
  anonymizedData: false,
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
        audioFormat: settingsPayload?.audioFormat ?? defaultSettings.audioFormat,
        audioQuality: settingsPayload?.audioQuality ?? defaultSettings.audioQuality,
        microphone: settingsPayload?.microphone ?? defaultSettings.microphone,
        dataStorage: settingsPayload?.dataStorage ?? defaultSettings.dataStorage,
        anonymizedData: settingsPayload?.anonymizedData ?? defaultSettings.anonymizedData,
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

  const handleSettingsChange = (newValues: Partial<SettingsState>) => {
    setSettings(current => {
      const next = { ...current, ...newValues }
      return next
    })
  }

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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex transition-colors duration-300">
      <DashboardSidebar active="Settings" />

      <main className="flex-1 ml-52 overflow-auto flex justify-center">
        <div className="p-6 w-full max-w-6xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">Settings</h1>
            <p className="text-black/50 dark:text-white/50 text-sm">Manage your account and preferences</p>
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-semibold text-white">
                  {(name || 'J').slice(0, 1).toUpperCase()}
                </div>
                <button
                  onClick={() => setMessage('Avatar upload is not available yet.')}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  Avatar Upload Unavailable
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-black/60 dark:text-white/60 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-black/60 dark:text-white/60 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { handleSave().catch(() => undefined) }} disabled={isSaving || isLoading} className="min-w-[140px] flex items-center justify-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-colors disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleReset} disabled={isSaving || isLoading} className="min-w-[100px] flex items-center justify-center px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
                  Reset
                </button>
              </div>
            </div>
          </Section>

          <Section title="Audio Recording">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-black/60 dark:text-white/60 mb-2">Recording Format</label>
                  <select value={settings.audioFormat} onChange={(e) => handleSettingsChange({ audioFormat: e.target.value })} className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 bg-white dark:bg-black">
                    <option value="webm">WEBM</option>
                    <option value="mp3">MP3</option>
                    <option value="wav">WAV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-black/60 dark:text-white/60 mb-2">Audio Quality</label>
                  <select value={settings.audioQuality} onChange={(e) => handleSettingsChange({ audioQuality: e.target.value })} className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 bg-white dark:bg-black">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-black/60 dark:text-white/60 mb-2">Microphone</label>
                <select value={settings.microphone} onChange={(e) => handleSettingsChange({ microphone: e.target.value })} className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 bg-white dark:bg-black">
                  <option value="default">Default Microphone</option>
                  <option value="external">External USB Microphone</option>
                </select>
              </div>
              <button
                onClick={() => { testMicrophone().catch(() => undefined) }}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Test Microphone
              </button>
              {microphoneMessage && <p className="text-sm text-black/60 dark:text-white/60">{microphoneMessage}</p>}
            </div>
          </Section>

          <Section title="Privacy">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
                <div>
                  <p className="text-sm font-medium">Anonymized Model Improvement</p>
                  <p className="text-xs text-black/40 dark:text-white/40">Contribute anonymized data to improve AI</p>
                </div>
                <Toggle enabled={settings.anonymizedData} onChange={(value) => handleSettingsChange({ anonymizedData: value })} />
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">Export Personal Data</p>
                <button onClick={() => { downloadExport('/api/export/personal-data', 'moodflow-personal-data.json').catch((downloadError) => setError(downloadError instanceof Error ? downloadError.message : 'Export failed.')) }} className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  Download
                </button>
              </div>
            </div>
          </Section>

          <Section title="Data Management">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">Export Session Data</p>
                <button onClick={() => { downloadExport('/api/export/sessions', 'moodflow-sessions.json').catch((downloadError) => setError(downloadError instanceof Error ? downloadError.message : 'Export failed.')) }} className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">Export Emotional Insights</p>
                <button onClick={() => { downloadExport('/api/export/insights', 'moodflow-insights.json').catch((downloadError) => setError(downloadError instanceof Error ? downloadError.message : 'Export failed.')) }} className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-black/10 dark:border-white/10 mt-4 pt-4">
                <div>
                  <p className="text-sm font-medium">Clear Session History</p>
                  <p className="text-xs text-black/40 dark:text-white/40">Delete all past sessions</p>
                </div>
                <button onClick={() => setShowConfirm('sessions')} className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors">
                  Clear
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Delete All Recordings</p>
                  <p className="text-xs text-black/40 dark:text-white/40">Permanently remove all audio recordings</p>
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
                <span className="text-black/60 dark:text-white/60">Application Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-black/60 dark:text-white/60">Analysis Model</span>
                <span>EmotionVAD v2.1</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-black/60 dark:text-white/60">Build</span>
                <span>2026.03.17</span>
              </div>
              <div className="flex gap-4 pt-3 border-t border-black/10 dark:border-white/10 mt-3">
                <a href="#" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">Documentation</a>
                <a href="#" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">Support</a>
                <a href="#" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
          </Section>

          {showConfirm && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#0d0d0d] border border-black/10 dark:border-white/20 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                <h3 className="text-lg font-medium mb-2">Confirm Action</h3>
                <p className="text-sm text-black/60 dark:text-white/60 mb-4">
                  Are you sure you want to {showConfirm === 'sessions' ? 'clear your session history' : 'delete all recordings'}? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirm(null)}
                    className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
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
