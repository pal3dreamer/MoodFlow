'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: '◉', active: false },
  { label: 'Sessions', href: '/dashboard/sessions', icon: '◇', active: false },
  { label: 'Insights', href: '/dashboard/insights', icon: '◈', active: false },
  { label: 'Recordings', href: '/dashboard/recordings', icon: '▸', active: true },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙', active: false },
]

const recordings = [
  { id: 1, title: 'Morning Check-in', duration: '0:45', date: 'Today', time: '9:00 AM', status: 'Analyzed', focus: 82, stress: 12, calm: 6, transcription: 'Starting my morning study session feeling refreshed and ready to tackle the day.', session: 'Algorithms Study' },
  { id: 2, title: 'Pre-Work Briefing', duration: '1:20', date: 'Today', time: '2:00 PM', status: 'Analyzed', focus: 65, stress: 28, calm: 7, transcription: 'Need to finish this lab report before the deadline. Feeling a bit pressured but focused.', session: 'Lab Report Writing' },
  { id: 3, title: 'Midday Break', duration: '0:32', date: 'Yesterday', time: '12:30 PM', status: 'Analyzed', focus: 45, stress: 15, calm: 40, transcription: 'Taking a short break to clear my mind. The math problems were challenging.', session: null },
  { id: 4, title: 'Study Session Intro', duration: '2:15', date: 'Yesterday', time: '10:00 AM', status: 'Analyzed', focus: 78, stress: 8, calm: 14, transcription: 'Beginning my physics lecture review. The concepts are starting to make sense now.', session: 'Physics Lecture' },
  { id: 5, title: 'Late Night Review', duration: '0:58', date: '2 days ago', time: '11:00 PM', status: 'Analyzed', focus: 55, stress: 35, calm: 10, transcription: 'Reviewing chemistry notes late at night. Getting tired but want to finish this chapter.', session: 'Chemistry Notes' },
  { id: 6, title: 'Quick Motivation', duration: '0:25', date: '2 days ago', time: '8:00 AM', status: 'Analyzed', focus: 90, stress: 5, calm: 5, transcription: 'Feeling energized and ready to write my essay. This is going to be great.', session: 'Essay Drafting' },
  { id: 7, title: 'Deep Work Check', duration: '1:45', date: '3 days ago', time: '3:00 PM', status: 'Analyzed', focus: 72, stress: 22, calm: 6, transcription: 'Working on data structures problems. Some sections are really challenging.', session: 'Data Structures' },
  { id: 8, title: 'Processing...', duration: '0:00', date: '3 days ago', time: '5:00 PM', status: 'Processing', focus: 0, stress: 0, calm: 0, transcription: 'Uploading new recording...', session: null },
]

const getEmotionColor = (emotion: string) => {
  switch (emotion) {
    case 'Calm': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'Focused': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'Stressed': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'Fatigued': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    default: return 'bg-white/10 text-white/60 border-white/20'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Analyzed': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'Processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'Error': return 'bg-red-500/20 text-red-400 border-red-500/30'
    default: return 'bg-white/10 text-white/60 border-white/20'
  }
}

export default function Recordings() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [isDragging, setIsDragging] = useState(false)
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredRecordings = recordings.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(search.toLowerCase()) || 
                         rec.transcription.toLowerCase().includes(search.toLowerCase()) ||
                         (rec.session && rec.session.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'All' || rec.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'newest') return 0
    if (sortBy === 'oldest') return 1
    if (sortBy === 'longest') return parseInt(b.duration.replace(':', '')) - parseInt(a.duration.replace(':', ''))
    return 0
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const togglePlay = (id: number) => {
    setCurrentPlaying(currentPlaying === id ? null : id)
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
            <h1 className="text-xl font-semibold mb-1">Recordings</h1>
            <p className="text-white/50 text-sm">View and manage your audio recordings</p>
          </div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-white/40 bg-white/5' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-medium mb-1">Drop audio files here or click to upload</p>
                  <p className="text-sm text-white/40">Supports WAV, MP3, M4A, WEBM</p>
                </div>
                <button 
                  onClick={handleFileSelect}
                  className="mt-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Choose Files
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".wav,.mp3,.m4a,.webm"
                  className="hidden"
                  multiple
                />
              </div>
            </div>
          </motion.div>

          {/* Filters & Search */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Search recordings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
              >
                <option value="All" className="bg-black">All Status</option>
                <option value="Analyzed" className="bg-black">Analyzed</option>
                <option value="Processing" className="bg-black">Processing</option>
                <option value="Error" className="bg-black">Error</option>
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
            </select>
          </div>

          {/* Recent Recording Highlight */}
          {filteredRecordings[0] && filteredRecordings[0].status === 'Analyzed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 mb-1">Most Recent</p>
                  <h3 className="text-base font-medium mb-1">{filteredRecordings[0].title}</h3>
                  <p className="text-sm text-white/60">{filteredRecordings[0].duration} • {filteredRecordings[0].date} at {filteredRecordings[0].time}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-white/40 mb-1">Detected Emotion</p>
                    <span className={`px-3 py-1 rounded-full text-sm border ${getEmotionColor('Focused')}`}>Focused</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 mb-1">Focus Score</p>
                    <p className="text-xl font-semibold">{filteredRecordings[0].focus}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recordings List */}
          <div className="space-y-3">
            {filteredRecordings.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Play Button */}
                  <button
                    onClick={() => togglePlay(rec.id)}
                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 hover:bg-white/20 transition-colors"
                  >
                    {currentPlaying === rec.id ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-medium truncate">{rec.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs border flex-shrink-0 ${getStatusColor(rec.status)}`}>
                        {rec.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
                      <span>{rec.duration}</span>
                      <span>{rec.date} at {rec.time}</span>
                      {rec.session && <span>{rec.session}</span>}
                    </div>
                    {rec.status === 'Analyzed' && (
                      <>
                        <p className="text-sm text-white/60 mb-3 line-clamp-1">"{rec.transcription}"</p>
                        
                        {/* Emotion Scores */}
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40 w-12">Focus</span>
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rec.focus}%` }} />
                            </div>
                            <span className="text-xs text-white/60 w-8">{rec.focus}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40 w-12">Stress</span>
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: `${rec.stress}%` }} />
                            </div>
                            <span className="text-xs text-white/60 w-8">{rec.stress}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40 w-12">Calm</span>
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${rec.calm}%` }} />
                            </div>
                            <span className="text-xs text-white/60 w-8">{rec.calm}%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* View Details */}
                  <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredRecordings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/40">No recordings found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
