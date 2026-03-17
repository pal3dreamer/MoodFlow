'use client'

import { useEffect, useRef, useState } from 'react'

type VoiceCheckModalProps = {
  mode: 'start' | 'end'
  open: boolean
  sessionTitle?: string
  loading?: boolean
  error?: string
  onClose: () => void
  onSubmit: (payload: { title?: string; topic?: string; file: File }) => Promise<void> | void
}

export default function VoiceCheckModal({
  mode,
  open,
  sessionTitle,
  loading = false,
  error,
  onClose,
  onSubmit,
}: VoiceCheckModalProps) {
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [permissionError, setPermissionError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!open) {
      cleanup()
      setPermissionError('')
      setAudioBlob(null)
      setAudioUrl('')
      if (mode === 'start') {
        setTitle('')
        setTopic('')
      }
    }
  }, [mode, open])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  function cleanup() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }

    chunksRef.current = []
    mediaRecorderRef.current = null
    setIsRecording(false)
  }

  async function startRecording() {
    setPermissionError('')
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl('')
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })

      streamRef.current = stream
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const nextUrl = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(nextUrl)
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setIsRecording(false)
      }

      recorder.start()
      setIsRecording(true)
    } catch {
      setPermissionError('Microphone access is required to record your voice check-in.')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  async function handleSubmit() {
    if (!audioBlob) {
      setPermissionError('Record a voice check-in before submitting.')
      return
    }

    if (mode === 'start' && !title.trim()) {
      setPermissionError('Session title is required.')
      return
    }

    const fileName = mode === 'start' ? 'session-checkin.webm' : 'session-checkout.webm'
    const file = new File([audioBlob], fileName, { type: audioBlob.type || 'audio/webm' })
    await onSubmit({
      title: title.trim(),
      topic: topic.trim(),
      file,
    })
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {mode === 'start' ? 'Start Session Check-in' : 'End Session Check-out'}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {mode === 'start'
                ? 'Add your session title, then record a short voice check-in before the session begins.'
                : `Record a short checkout for ${sessionTitle ?? 'this session'} before ending it.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-white/10 px-3 py-1 text-sm text-white/60 transition-colors hover:text-white disabled:opacity-50"
          >
            Close
          </button>
        </div>

        {mode === 'start' && (
          <div className="mb-4 grid gap-4">
            <div>
              <label className="mb-2 block text-sm text-white/60">Session Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Algorithms Study"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white/30"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Topic (Optional)</label>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Sorting practice"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white/30"
              />
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{isRecording ? 'Recording in progress' : 'Voice capture'}</p>
              <p className="text-xs text-white/40">
                {isRecording ? 'Speak naturally and stop when you are done.' : 'Record a short voice note for analysis.'}
              </p>
            </div>
            <span className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={() => {
                  startRecording().catch(() => undefined)
                }}
                disabled={loading}
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                Record Voice
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                disabled={loading}
                className="rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                Stop Recording
              </button>
            )}

            {audioUrl && (
              <audio controls src={audioUrl} className="h-10 max-w-full" />
            )}
          </div>
        </div>

        {(permissionError || error) && (
          <p className="mt-4 text-sm text-red-400">{permissionError || error}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              handleSubmit().catch(() => undefined)
            }}
            disabled={loading || isRecording}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : mode === 'start' ? 'Start Session' : 'End Session'}
          </button>
        </div>
      </div>
    </div>
  )
}
