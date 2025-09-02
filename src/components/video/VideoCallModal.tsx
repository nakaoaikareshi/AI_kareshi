import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { RealisticAvatar } from '@/components/avatar/RealisticAvatar';
import { useCharacterStore } from '@/store/characterStore';
import { speechSynthesis } from '@/utils/speechSynthesis';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
}) => {
  const { character } = useCharacterStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMood, setCurrentMood] = useState(75);

  useEffect(() => {
    if (isOpen && character) {
      const greetingMessages = [
        'お疲れ様！ビデオ通話嬉しいな💕',
        'わあ〜顔が見えて嬉しい！',
        'やっとお顔が見れた♪今日はどうだった？',
        'ビデオ通話ありがとう！何話そうか？',
      ];
      
      const greeting = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
      
      setTimeout(() => {
        setIsSpeaking(true);
        speechSynthesis.speak(greeting, {
          voice: speechSynthesis.getCharacterVoice(character.gender)?.name,
          rate: character.gender === 'girlfriend' ? 1.1 : 0.9,
          pitch: character.gender === 'girlfriend' ? 1.2 : 0.8,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false)
        });
        
        onSendMessage(greeting);
      }, 1000);
    }

    return () => {
      speechSynthesis.stop();
      setIsSpeaking(false);
    };
  }, [isOpen, character, onSendMessage]);

  const handleEndCall = () => {
    speechSynthesis.stop();
    setIsSpeaking(false);
    onClose();
  };

  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-2xl mx-4 rounded-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-white font-medium">{character.nickname}</h3>
              <p className="text-green-400 text-sm">通話中</p>
            </div>
          </div>
          <div className="text-white text-sm">
            通話時間: 00:00
          </div>
        </div>

        {/* メインビデオエリア */}
        <div className="bg-gradient-to-b from-purple-900 via-pink-900 to-purple-900 h-96 flex items-center justify-center relative">
          {isVideoOn ? (
            <RealisticAvatar 
              avatar={character.avatar || {
                hairStyle: 'medium',
                hairColor: 'brown',
                eyeColor: 'brown',
                eyeShape: 'round',
                eyebrowStyle: 'natural',
                noseStyle: 'small',
                mouthStyle: 'small',
                skinTone: '#FDBCB4',
                faceShape: 'oval',
                bodyType: 'average',
                height: 'average',
                outfit: 'casual',
                topWear: 'tshirt',
                bottomWear: 'pants',
                shoes: 'sneakers',
                accessories: [],
                jewelry: [],
                makeup: []
              }}
              size="large"
              mood={currentMood}
              isSpeaking={isSpeaking}
              isBlinking={true}
            />
          ) : (
            <div className="text-center text-white">
              <VideoOff size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-lg">ビデオがオフです</p>
            </div>
          )}

          {/* ユーザーカメラプレビュー（小さく右下に） */}
          <div className="absolute bottom-4 right-4 w-24 h-18 bg-gray-700 rounded-lg border-2 border-white overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-800 flex items-center justify-center">
              <span className="text-white text-2xl">👤</span>
            </div>
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-center space-x-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full transition-colors ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
            title={isMuted ? 'ミュート解除' : 'ミュート'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-full transition-colors ${
              !isVideoOn 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
            title={isVideoOn ? 'ビデオオフ' : 'ビデオオン'}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            title="通話終了"
          >
            <PhoneOff size={20} />
          </button>
        </div>

        {/* 通話中のメッセージ */}
        <div className="bg-gray-900 px-4 py-2 text-center">
          <p className="text-gray-400 text-sm">
            {isSpeaking ? `${character.nickname}が話しています...` : '何か話しかけてみてください'}
          </p>
        </div>
      </div>
    </div>
  );
};