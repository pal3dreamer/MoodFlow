'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardSidebar from '@/components/DashboardSidebar'

type DistributionItem = {
  emotion: string
  value: number
}

type RecordingItem = {
  id: string
  title: string
  durationSeconds: number
  duration: string
  date: string
  time: string
  status: string
  focus: number
  stress: number
  calm: number
  dominantEmotion: string
  transcription: string
  session: string | null
}

type RecordingDetail = {
  id: string
  title: string
  status: string
  transcript: string | null
  topic: string | null
  dominantEmotion: string | null
  durationSeconds: number
  createdAt: string
  processingError: string | null
  focusSession?: {
    title: string
  } | null
  distribution?: DistributionItem[] | null
  aiInsights?: string[] | null
  aiRecommendations?: string[] | null
}

function formatDuration(durationSeconds: number) {
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }
  return `0:${String(seconds).padStart(2, '0')}`
}

function titleEmotion(emotion: string | null | undefined) {
  if (!emotion) return 'Unknown'
  return emotion
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function mapRecording(recording: any): RecordingItem {
  const distribution = Array.isArray(recording.distribution) ? recording.distribution : []
  const focus = distribution.find((item: DistributionItem) => item.emotion === 'Focused')?.value ?? 0
  const stress = distribution.find((item: DistributionItem) => item.emotion === 'Stressed')?.value ?? 0
  const calm = distribution.find((item: DistributionItem) => item.emotion === 'Calm')?.value ?? 0
  const createdAt = new Date(recording.createdAt)

  return {
    id: recording.id,
    title: recording.title,
    durationSeconds: recording.durationSeconds ?? 0,
    duration: formatDuration(recording.durationSeconds ?? 0),
    date: createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    status: recording.status.charAt(0) + recording.status.slice(1).toLowerCase(),
    focus,
    stress,
    calm,
    dominantEmotion: titleEmotion(recording.dominantEmotion),
    transcription: recording.transcript ?? '',
    session: recording.focusSession?.title ?? null,
  }
}

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
    case 'Queued': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'Failed': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'Error': return 'bg-red-500/20 text-red-400 border-red-500/30'
    default: return 'bg-white/10 text-white/60 border-white/20'
  }
}

export default function RecordingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [isDragging, setIsDragging] = useState(false)
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)
  const [recordings, setRecordings] = useState<RecordingItem[]>([])
  const [uploadError, setUploadError] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedRecording, setSelectedRecording] = useState<RecordingDetail | null>(null)
  const [detailError, setDetailError] = useState('')
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  async function loadRecordings() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (sortBy) params.set('sort', sortBy)

    const response = await fetch(`/api/recordings?${params.toString()}`, {
      cache: 'no-store',
    })

    if (response.status === 401) {
      window.location.href = '/login'
      return
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Failed to load recordings' }))
      throw new Error(payload.error || 'Failed to load recordings')
    }

    const payload = await response.json()
    setRecordings((payload.items ?? []).map(mapRecording))
  }

  useEffect(() => {
    setIsLoading(true)
    setError('')
    loadRecordings()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load recordings')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [search, statusFilter, sortBy])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setCurrentPlaying(null)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const filteredRecordings = useMemo(() => recordings, [recordings])

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
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      void uploadFiles(files)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  async function togglePlay(id: string) {
    const audio = audioRef.current
    if (!audio) return

    if (currentPlaying === id) {
      audio.pause()
      audio.currentTime = 0
      setCurrentPlaying(null)
      return
    }

    audio.src = `/api/recordings/${id}/audio`
    try {
      await audio.play()
      setCurrentPlaying(id)
    } catch {
      setError('Unable to play this recording.')
      setCurrentPlaying(null)
    }
  }

  async function openDetails(id: string) {
    setSelectedRecording(null)
    setDetailError('')
    setIsDetailLoading(true)

    try {
      const response = await fetch(`/api/recordings/${id}`, { cache: 'no-store' })
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to load recording details' }))
        throw new Error(payload.error || 'Failed to load recording details')
      }

      const payload = await response.json()
      setSelectedRecording({
        id: payload.id,
        title: payload.title,
        status: payload.status,
        transcript: payload.transcript ?? null,
        topic: payload.topic ?? null,
        dominantEmotion: payload.dominantEmotion ?? null,
        durationSeconds: payload.durationSeconds ?? 0,
        createdAt: payload.createdAt,
        processingError: payload.processingError ?? null,
        focusSession: payload.focusSession ?? null,
        distribution: Array.isArray(payload.distribution) ? payload.distribution : [],
        aiInsights: Array.isArray(payload.aiInsights) ? payload.aiInsights : [],
        aiRecommendations: Array.isArray(payload.aiRecommendations) ? payload.aiRecommendations : [],
      })
    } catch (loadError) {
      setDetailError(loadError instanceof Error ? loadError.message : 'Failed to load recording details')
    } finally {
      setIsDetailLoading(false)
    }
  }

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    setUploadError('')

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.set('file', file)
        const endpoint = file.size <= 5 * 1024 * 1024 ? '/api/recordings/checkin' : '/api/recordings/session-audio'
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        })

        if (response.status === 401) {
          window.location.href = '/login'
          return
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: 'Upload failed' }))
          throw new Error(payload.error || 'Upload failed')
        }
      }

      await loadRecordings()
    } catch (nextError) {
      setUploadError(nextError instanceof Error ? nextError.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const recentAnalyzed = filteredRecordings.find((recording) => recording.status === 'Analyzed')

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar active="Recordings" />

      <main className="flex-1 ml-52 overflow-auto flex justify-center">
        <div className="p-6 w-full max-w-6xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">Recordings</h1>
            <p className="text-white/50 text-sm">View and manage your audio recordings</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

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
                isDragging ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20'
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
                  disabled={isUploading}
                  className="mt-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Choose Files'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav,.mp3,.m4a,.webm"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? [])
                    if (files.length > 0) {
                      void uploadFiles(files)
                    }
                  }}
                />
                {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
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

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
              >
                <option value="All" className="bg-black">All Status</option>
                <option value="Analyzed" className="bg-black">Analyzed</option>
                <option value="Processing" className="bg-black">Processing</option>
                <option value="Failed" className="bg-black">Failed</option>
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
            </select>
          </div>

          {recentAnalyzed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 mb-1">Most Recent</p>
                  <h3 className="text-base font-medium mb-1">{recentAnalyzed.title}</h3>
                  <p className="text-sm text-white/60">{recentAnalyzed.duration} • {recentAnalyzed.date} at {recentAnalyzed.time}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-white/40 mb-1">Detected Emotion</p>
                    <span className={`px-3 py-1 rounded-full text-sm border ${getEmotionColor(recentAnalyzed.dominantEmotion)}`}>
                      {recentAnalyzed.dominantEmotion}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 mb-1">Focus Score</p>
                    <p className="text-xl font-semibold">{recentAnalyzed.focus}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <audio ref={audioRef} className="hidden" />

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
                  <button
                    onClick={() => { void togglePlay(rec.id) }}
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
                        <p className="text-sm text-white/60 mb-3 line-clamp-1">"{rec.transcription || 'No transcript available.'}"</p>
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

                  <button
                    onClick={() => { void openDetails(rec.id) }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                  >
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <p className="text-white/40">Loading recordings...</p>
            </div>
          )}

          {!isLoading && filteredRecordings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/40">No recordings found</p>
            </div>
          )}
        </div>
      </main>

      {(selectedRecording || isDetailLoading || detailError) && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Recording Details</h2>
                <p className="text-sm text-white/50">Analysis and transcript for this upload</p>
              </div>
              <button
                onClick={() => {
                  setSelectedRecording(null)
                  setDetailError('')
                }}
                className="text-white/50 hover:text-white"
              >
                Close
              </button>
            </div>

            {isDetailLoading && <p className="text-sm text-white/40">Loading details...</p>}
            {detailError && <p className="text-sm text-red-400">{detailError}</p>}

            {selectedRecording && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-medium">{selectedRecording.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(titleEmotion(selectedRecording.status))}`}>
                    {titleEmotion(selectedRecording.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/40 mb-1">Duration</p>
                    <p>{formatDuration(selectedRecording.durationSeconds)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/40 mb-1">Detected Emotion</p>
                    <p>{titleEmotion(selectedRecording.dominantEmotion)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/40 mb-1">Created</p>
                    <p>{new Date(selectedRecording.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/40 mb-1">Session</p>
                    <p>{selectedRecording.focusSession?.title ?? 'Standalone recording'}</p>
                  </div>
                </div>

                {selectedRecording.transcript && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/40 mb-2 text-sm">Transcript</p>
                    <p className="text-sm text-white/80 leading-6">{selectedRecording.transcript}</p>
                  </div>
                )}

                {selectedRecording.processingError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {selectedRecording.processingError}
                  </div>
                )}

                {Array.isArray(selectedRecording.aiInsights) && selectedRecording.aiInsights.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/40 mb-2 text-sm">Insights</p>
                    <div className="space-y-2">
                      {selectedRecording.aiInsights.map((insight) => (
                        <p key={insight} className="text-sm text-white/80">{insight}</p>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(selectedRecording.aiRecommendations) && selectedRecording.aiRecommendations.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/40 mb-2 text-sm">Recommendations</p>
                    <div className="space-y-2">
                      {selectedRecording.aiRecommendations.map((recommendation) => (
                        <p key={recommendation} className="text-sm text-white/80">{recommendation}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
