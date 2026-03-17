'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: '◉', active: false },
  { label: 'Sessions', href: '/dashboard/sessions', icon: '◇', active: false },
  { label: 'Insights', href: '/dashboard/insights', icon: '◈', active: false },
  { label: 'Recordings', href: '/dashboard/recordings', icon: '▸', active: false },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙', active: true },
]

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

export default function Settings() {
  const [name, setName] = useState('John Doe')
  const [email, setEmail] = useState('john@example.com')
  
  const [sessionNameFormat, setSessionNameFormat] = useState('topic-date')
  const [durationReminder, setDurationReminder] = useState('45')
  const [autoEnd, setAutoEnd] = useState(true)
  const [autoInsights, setAutoInsights] = useState(true)
  
  const [trajectoryTracking, setTrajectoryTracking] = useState(true)
  const [stressDetection, setStressDetection] = useState(true)
  const [patternAnalysis, setPatternAnalysis] = useState(true)
  const [aiRecommendations, setAiRecommendations] = useState(true)
  
  const [audioFormat, setAudioFormat] = useState('webm')
  const [audioQuality, setAudioQuality] = useState('high')
  const [microphone, setMicrophone] = useState('default')
  
  const [sessionReminders, setSessionReminders] = useState(true)
  const [breakReminders, setBreakReminders] = useState(true)
  const [weeklyInsights, setWeeklyInsights] = useState(false)
  const [trendSummaries, setTrendSummaries] = useState(true)
  
  const [dataStorage, setDataStorage] = useState(true)
  const [anonymizedData, setAnonymizedData] = useState(false)
  
  const [theme, setTheme] = useState('dark')
  const [graphAnimation, setGraphAnimation] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  
  const [showConfirm, setShowConfirm] = useState<string | null>(null)

  const handleSave = () => {
    alert('Settings saved')
  }

  const handleReset = () => {
    setName('John Doe')
    setEmail('john@example.com')
  }

  const confirmAction = (action: string) => {
    setShowConfirm(action)
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
        <div className="p-6 w-full max-w-3xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">Settings</h1>
            <p className="text-white/50 text-sm">Manage your account and preferences</p>
          </div>

          {/* Account Settings */}
          <Section title="Account">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-semibold">
                  J
                </div>
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
                  Change Avatar
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
                <button onClick={handleSave} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Save Changes
                </button>
                <button onClick={handleReset} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
                  Reset
                </button>
              </div>
            </div>
          </Section>

          {/* Session Preferences */}
          <Section title="Session Preferences">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Default Session Name Format</label>
                  <select
                    value={sessionNameFormat}
                    onChange={(e) => setSessionNameFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                  >
                    <option value="topic-date" className="bg-black">Topic + Date</option>
                    <option value="date-topic" className="bg-black">Date + Topic</option>
                    <option value="topic" className="bg-black">Topic Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Duration Reminder (minutes)</label>
                  <select
                    value={durationReminder}
                    onChange={(e) => setDurationReminder(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                  >
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
                <Toggle enabled={autoEnd} onChange={setAutoEnd} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Auto-generate Insights</p>
                  <p className="text-xs text-white/40">Generate insights after each session</p>
                </div>
                <Toggle enabled={autoInsights} onChange={setAutoInsights} />
              </div>
            </div>
          </Section>

          {/* Emotional Analysis */}
          <Section title="Emotional Analysis">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Emotional Trajectory Tracking</p>
                  <p className="text-xs text-white/40">Track VAD values over time</p>
                </div>
                <Toggle enabled={trajectoryTracking} onChange={setTrajectoryTracking} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Stress Spike Detection</p>
                  <p className="text-xs text-white/40">Alert when stress levels spike</p>
                </div>
                <Toggle enabled={stressDetection} onChange={setStressDetection} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Productivity Pattern Analysis</p>
                  <p className="text-xs text-white/40">Detect patterns in your work sessions</p>
                </div>
                <Toggle enabled={patternAnalysis} onChange={setPatternAnalysis} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">AI Recommendations</p>
                  <p className="text-xs text-white/40">Receive personalized suggestions</p>
                </div>
                <Toggle enabled={aiRecommendations} onChange={setAiRecommendations} />
              </div>
            </div>
          </Section>

          {/* Audio Recording */}
          <Section title="Audio Recording">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Recording Format</label>
                  <select
                    value={audioFormat}
                    onChange={(e) => setAudioFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                  >
                    <option value="webm" className="bg-black">WEBM</option>
                    <option value="mp3" className="bg-black">MP3</option>
                    <option value="wav" className="bg-black">WAV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Audio Quality</label>
                  <select
                    value={audioQuality}
                    onChange={(e) => setAudioQuality(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                  >
                    <option value="high" className="bg-black">High</option>
                    <option value="medium" className="bg-black">Medium</option>
                    <option value="low" className="bg-black">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Microphone</label>
                <select
                  value={microphone}
                  onChange={(e) => setMicrophone(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="default" className="bg-black">Default Microphone</option>
                  <option value="external" className="bg-black">External USB Microphone</option>
                </select>
              </div>
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
                Test Microphone
              </button>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Session Reminders</p>
                  <p className="text-xs text-white/40">Remind to start focus sessions</p>
                </div>
                <Toggle enabled={sessionReminders} onChange={setSessionReminders} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Break Reminders</p>
                  <p className="text-xs text-white/40">Prompt for breaks during long sessions</p>
                </div>
                <Toggle enabled={breakReminders} onChange={setBreakReminders} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Weekly Insights</p>
                  <p className="text-xs text-white/40">Receive weekly productivity summary</p>
                </div>
                <Toggle enabled={weeklyInsights} onChange={setWeeklyInsights} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Emotional Trend Summaries</p>
                  <p className="text-xs text-white/40">Weekly emotional pattern updates</p>
                </div>
                <Toggle enabled={trendSummaries} onChange={setTrendSummaries} />
              </div>
            </div>
          </Section>

          {/* Privacy */}
          <Section title="Privacy">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Emotional Data Storage</p>
                  <p className="text-xs text-white/40">Store emotional analysis data locally</p>
                </div>
                <Toggle enabled={dataStorage} onChange={setDataStorage} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Anonymized Model Improvement</p>
                  <p className="text-xs text-white/40">Contribute anonymized data to improve AI</p>
                </div>
                <Toggle enabled={anonymizedData} onChange={setAnonymizedData} />
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">Export Personal Data</p>
                <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-colors">
                  Download
                </button>
              </div>
            </div>
          </Section>

          {/* Appearance */}
          <Section title="Appearance">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                >
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
                <Toggle enabled={graphAnimation} onChange={setGraphAnimation} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Reduced Motion</p>
                  <p className="text-xs text-white/40">Minimize UI animations</p>
                </div>
                <Toggle enabled={reducedMotion} onChange={setReducedMotion} />
              </div>
            </div>
          </Section>

          {/* Data Management */}
          <Section title="Data Management">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">Export Session Data</p>
                <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-colors">
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">Export Emotional Insights</p>
                <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-colors">
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-white/10 mt-4 pt-4">
                <div>
                  <p className="text-sm font-medium">Clear Session History</p>
                  <p className="text-xs text-white/40">Delete all past sessions</p>
                </div>
                <button 
                  onClick={() => confirmAction('sessions')}
                  className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Delete All Recordings</p>
                  <p className="text-xs text-white/40">Permanently remove all audio recordings</p>
                </div>
                <button 
                  onClick={() => confirmAction('recordings')}
                  className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </Section>

          {/* About */}
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

          {/* Confirmation Modal */}
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
                    onClick={() => setShowConfirm(null)}
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
