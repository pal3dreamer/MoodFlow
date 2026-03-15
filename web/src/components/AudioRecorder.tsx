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
    
    // Safety check for navigator.mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support audio recording or you are in an insecure context (HTTP). Please use HTTPS or localhost.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check if MediaRecorder is supported
      if (typeof MediaRecorder === 'undefined') {
        setError("MediaRecorder is not supported in this browser.");
        return;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      if (err.name === 'NotAllowedError') {
        setError("Microphone permission denied.");
      } else {
        setError(`Microphone error: ${err.message}`);
      }
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
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm w-full"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 w-full transition-all duration-500 hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.15)]">
        {/* Decorative background circle */}
        <div className={`absolute inset-0 rounded-[3rem] opacity-[0.03] transition-colors duration-700 ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`} />

        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div 
              key="recording"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-6 z-10"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-red-500/10 rounded-full animate-ping" />
                <div className="text-4xl font-light tracking-tight text-slate-800 font-mono">
                  {formatTime(recordingTime)}
                </div>
              </div>
              
              <button
                onClick={stopRecording}
                className="group relative flex items-center justify-center w-20 h-20 bg-slate-900 text-white rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
              >
                <Square size={24} fill="currentColor" />
                <span className="absolute -bottom-10 whitespace-nowrap text-xs font-medium text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Stop Session
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-6 z-10"
            >
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-slate-800">Voice Check-in</h3>
                <p className="text-sm text-slate-500 max-w-[200px]">Record a brief intent to start or end your flow</p>
              </div>

              <button
                onClick={startRecording}
                disabled={isProcessing}
                className={`group relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl ${
                  isProcessing 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {isProcessing ? (
                  <Loader2 size={32} className="animate-spin" />
                ) : (
                  <Mic size={32} />
                )}
                
                {!isProcessing && (
                  <div className="absolute -inset-2 rounded-full border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
        {isRecording ? 'System Live' : 'System Ready'}
      </div>
    </div>
  );
};

export default AudioRecorder;
