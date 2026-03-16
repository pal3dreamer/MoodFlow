'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setError(err.name === 'NotAllowedError' ? "Permission denied." : `Error: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm mb-6"
          >
            <AlertCircle size={18} />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group overflow-hidden bg-white border border-stone-200 rounded-3xl transition-all duration-500 hover:border-stone-900 shadow-sm hover:shadow-2xl hover:shadow-stone-200/50">
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center gap-6">
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 ${
              isRecording ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse' : 'bg-stone-50 text-stone-900 group-hover:bg-stone-900 group-hover:text-white'
            }`}>
              {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                {isRecording ? 'Voice Sampling...' : 'Record Check-in'}
              </h3>
              <p className="text-sm text-stone-400 font-medium">
                {isRecording ? `Recording session for ${formatTime(recordingTime)}` : 'Briefly describe your current focus'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="px-8 py-4 bg-stone-950 text-white rounded-2xl text-sm font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-xl"
              >
                End Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className={`px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  isProcessing 
                    ? 'bg-stone-100 text-stone-300 cursor-not-allowed' 
                    : 'bg-stone-950 text-white hover:scale-105 active:scale-95 shadow-xl'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing
                  </div>
                ) : (
                  'Start Flow'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Visualizer Placeholder */}
        {isRecording && (
          <div className="absolute bottom-0 left-0 right-0 h-1 flex items-end gap-[2px] px-1 overflow-hidden">
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [4, 16, 8, 20, 4] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5 + Math.random(),
                  ease: "easeInOut"
                }}
                className="flex-1 bg-rose-400"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
