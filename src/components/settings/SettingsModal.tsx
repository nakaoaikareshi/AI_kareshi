import React, { useState } from 'react';
import { Settings, X, Palette } from 'lucide-react';
import { useCharacterStore } from '@/store/characterStore';
import { useUserStore } from '@/store/userStore';
import { Character, User, AvatarSettings } from '@/types';
import { AvatarCustomizer } from '@/components/avatar/AvatarCustomizer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { character, updatePersonality, updateAvatar, clearCharacter } = useCharacterStore();
  const { user, clearUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<'user' | 'character'>('user');
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);

  const defaultAvatar: AvatarSettings = {
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
    makeup: [],
  };

  const handleAvatarUpdate = (avatar: AvatarSettings) => {
    updateAvatar(avatar);
    console.log('Avatar updated:', avatar);
  };

  if (!isOpen || !character || !user) return null;

  const handleReset = () => {
    if (confirm('すべての設定をリセットしますか？会話履歴も削除されます。')) {
      clearCharacter();
      clearUser();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">設定</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'user' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            あなたの情報
          </button>
          <button
            onClick={() => setActiveTab('character')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'character' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            キャラクター
          </button>
        </div>

        <div className="p-4 space-y-4">
          {activeTab === 'user' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">お名前</label>
                <p className="text-gray-700">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">呼び名</label>
                <p className="text-gray-700">{user.nickname}</p>
              </div>
            </>
          )}

          {activeTab === 'character' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">本名</label>
                <p className="text-gray-700">{character.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">呼び名</label>
                <p className="text-gray-700">{character.nickname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">基本情報</label>
                <p className="text-gray-700 text-sm">
                  {character.gender === 'boyfriend' ? '彼氏' : '彼女'} / {character.age}歳 / {character.occupation}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">趣味</label>
                <p className="text-gray-700 text-sm">{character.hobbies.join('、')}</p>
              </div>
              
              {/* アバターカスタマイズボタン */}
              <div className="mb-4">
                <button
                  onClick={() => setShowAvatarCustomizer(true)}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
                >
                  <Palette size={20} />
                  <span>見た目をカスタマイズ</span>
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">性格調整</label>
                {Object.entries({
                  kindness: '優しさ',
                  humor: '面白さ',
                  seriousness: '真面目さ',
                  activeness: '積極性',
                  empathy: '共感力',
                }).map(([key, label]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{label}</span>
                      <span className="text-sm text-gray-500">
                        {character.personality[key as keyof typeof character.personality]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={character.personality[key as keyof typeof character.personality]}
                      onChange={(e) => updatePersonality({
                        [key]: parseInt(e.target.value)
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t space-y-2">
          <button
            onClick={handleReset}
            className="w-full py-2 px-4 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
          >
            すべてリセット
          </button>
        </div>
      </div>

      {/* アバターカスタマイザー */}
      <AvatarCustomizer
        isOpen={showAvatarCustomizer}
        onClose={() => setShowAvatarCustomizer(false)}
        currentAvatar={character.avatar || defaultAvatar}
        onAvatarUpdate={handleAvatarUpdate}
        onOpenShop={() => {
          setShowAvatarCustomizer(false);
          // ショップを開く（後で実装）
        }}
      />
    </div>
  );
};