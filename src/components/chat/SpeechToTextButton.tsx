import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { speechRecognition } from '@/utils/speechRecognition';

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({ 
  onTranscript,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');

  const startListening = () => {
    if (!speechRecognition.isRecognitionSupported()) {
      alert('お使いのブラウザは音声認識をサポートしていません');
      return;
    }

    const success = speechRecognition.startListening({
      onStart: () => {
        setIsListening(true);
        setInterimText('');
      },
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          onTranscript(transcript);
          setInterimText('');
        } else {
          setInterimText(transcript);
        }
      },
      onEnd: () => {
        setIsListening(false);
        setInterimText('');
      },
      onError: (error) => {
        setIsListening(false);
        setInterimText('');
        console.error('Speech recognition error:', error);
        alert(error);
      }
    });

    if (!success) {
      alert('音声認識を開始できませんでした');
    }
  };

  const stopListening = () => {
    speechRecognition.stopListening();
    setIsListening(false);
    setInterimText('');
  };

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-full transition-all ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        } ${className}`}
        title={isListening ? '音声認識停止' : '音声入力'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* 音声認識中のテキスト表示 */}
      {interimText && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
          {interimText}
        </div>
      )}
      
      {isListening && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded text-xs">
          聞いています...
        </div>
      )}
    </div>
  );
};