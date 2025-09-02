import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';

interface VoiceRecorderProps {
  onVoiceMessage: (audioBlob: Blob) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onVoiceMessage, 
  isOpen, 
  onClose 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('マイクへのアクセスが許可されていません');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onVoiceMessage(audioBlob);
      resetRecorder();
      onClose();
    }
  };

  const resetRecorder = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">ボイスメッセージ</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* 録音状態表示 */}
          <div className="flex items-center space-x-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-red-500 animate-pulse' 
                : audioBlob 
                  ? 'bg-green-500' 
                  : 'bg-gray-200'
            }`}>
              {isRecording ? (
                <MicOff size={24} className="text-white" />
              ) : (
                <Mic size={24} className={audioBlob ? 'text-white' : 'text-gray-400'} />
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-mono text-gray-700">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-500">
                {isRecording ? '録音中...' : audioBlob ? '録音完了' : 'タップして録音開始'}
              </div>
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="flex space-x-3">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors"
              >
                録音開始
              </button>
            )}
            
            {isRecording && (
              <button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-colors"
              >
                録音停止
              </button>
            )}
            
            {audioBlob && !isRecording && (
              <>
                <button
                  onClick={resetRecorder}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors"
                >
                  やり直し
                </button>
                <button
                  onClick={sendVoiceMessage}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition-colors flex items-center space-x-2"
                >
                  <Send size={16} />
                  <span>送信</span>
                </button>
              </>
            )}
          </div>
          
          {/* 使用方法ヒント */}
          <div className="text-xs text-gray-500 text-center">
            {isRecording ? '録音を停止するボタンを押してください' : 
             audioBlob ? '録音したボイスメッセージを送信または再録音できます' :
             'マイクボタンをタップして音声を録音してください'}
          </div>
        </div>
      </div>
    </div>
  );
};