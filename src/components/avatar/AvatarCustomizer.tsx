import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { AvatarSettings } from '@/types';
import { AvatarPreview } from './AvatarPreview';

interface AvatarCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: AvatarSettings;
  onAvatarUpdate: (avatar: AvatarSettings) => void;
  onOpenShop: () => void;
}

const AVATAR_OPTIONS = {
  hairStyle: [
    { id: 'short', name: 'ショート', free: true, emoji: '🧑' },
    { id: 'medium', name: 'ミディアム', free: true, emoji: '👧' },
    { id: 'long', name: 'ロング', free: true, emoji: '👩' },
    { id: 'ponytail', name: 'ポニーテール', free: false, emoji: '👩‍🦰' },
    { id: 'twintails', name: 'ツインテール', free: false, emoji: '👯‍♀️' },
    { id: 'bob', name: 'ボブ', free: false, emoji: '👱‍♀️' },
    { id: 'curly', name: 'カーリー', free: false, emoji: '👩‍🦱' },
    { id: 'spiky', name: 'スパイキー', free: false, emoji: '🦔' },
  ],
  hairColor: [
    { id: 'black', name: '漆黒', free: true, color: '#2D2D2D' },
    { id: 'brown', name: 'チョコブラウン', free: true, color: '#8B4513' },
    { id: 'blonde', name: 'プラチナブロンド', free: false, color: '#FFD700' },
    { id: 'red', name: 'ルビーレッド', free: false, color: '#DC143C' },
    { id: 'blue', name: 'サファイアブルー', free: false, color: '#4169E1' },
    { id: 'pink', name: 'サクラピンク', free: false, color: '#FF69B4' },
    { id: 'silver', name: 'シルバー', free: false, color: '#C0C0C0' },
    { id: 'purple', name: 'ラベンダー', free: false, color: '#9370DB' },
    { id: 'white', name: 'スノーホワイト', free: false, color: '#F8F8FF' },
    { id: 'mint', name: 'ミントグリーン', free: false, color: '#98FB98' },
  ],
  eyeColor: [
    { id: 'brown', name: 'ハニーブラウン', free: true, color: '#8B4513' },
    { id: 'black', name: 'オニキス', free: true, color: '#2D2D2D' },
    { id: 'blue', name: 'サファイア', free: false, color: '#4169E1' },
    { id: 'green', name: 'エメラルド', free: false, color: '#228B22' },
    { id: 'hazel', name: 'ヘーゼルナッツ', free: false, color: '#DAA520' },
    { id: 'violet', name: 'アメジスト', free: false, color: '#8A2BE2' },
    { id: 'amber', name: 'アンバー', free: false, color: '#FFBF00' },
    { id: 'crimson', name: 'クリムゾン', free: false, color: '#DC143C' },
  ],
  outfit: [
    { id: 'casual', name: 'カジュアル', free: true, emoji: '👕' },
    { id: 'formal', name: 'フォーマル', free: true, emoji: '👔' },
    { id: 'sporty', name: 'スポーティ', free: false, emoji: '🏃‍♂️' },
    { id: 'elegant', name: 'エレガント', free: false, emoji: '👗' },
    { id: 'cute', name: 'キュート', free: false, emoji: '🎀' },
    { id: 'cool', name: 'クール', free: false, emoji: '🕶️' },
    { id: 'gothic', name: 'ゴシック', free: false, emoji: '🖤' },
    { id: 'sailor', name: 'セーラー服', free: false, emoji: '⚓' },
  ],
  accessories: [
    { id: 'none', name: 'なし', free: true, emoji: '🚫' },
    { id: 'ribbon', name: 'リボン', free: false, emoji: '🎀' },
    { id: 'glasses', name: 'メガネ', free: false, emoji: '👓' },
    { id: 'earrings', name: 'ピアス', free: false, emoji: '💎' },
  ],
};

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarUpdate,
  onOpenShop,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof AVATAR_OPTIONS>('hairStyle');
  const [tempAvatar, setTempAvatar] = useState<AvatarSettings>(currentAvatar);

  if (!isOpen) return null;

  const handleOptionSelect = (category: keyof AvatarSettings, optionId: string) => {
    const option = AVATAR_OPTIONS[category].find(opt => opt.id === optionId);
    if (!option) return;

    if (!option.free) {
      alert('このアイテムは有料です。ショップで購入してください。');
      return;
    }

    let updatedAvatar;
    if (category === 'accessories') {
      if (optionId === 'none') {
        updatedAvatar = {
          ...tempAvatar,
          accessories: [],
        };
      } else {
        const currentAccessories = tempAvatar.accessories || [];
        const hasAccessory = currentAccessories.includes(optionId);
        updatedAvatar = {
          ...tempAvatar,
          accessories: hasAccessory 
            ? currentAccessories.filter(acc => acc !== optionId)
            : [...currentAccessories, optionId],
        };
      }
    } else {
      updatedAvatar = {
        ...tempAvatar,
        [category]: optionId,
      };
    }
    setTempAvatar(updatedAvatar);
  };

  const handleSave = () => {
    onAvatarUpdate(tempAvatar);
    onClose();
  };

  const handleCancel = () => {
    setTempAvatar(currentAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">アバターカスタマイズ</h2>
          <div className="flex space-x-2">
            <button
              onClick={onOpenShop}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ShoppingBag size={16} />
              <span>ショップ</span>
            </button>
            <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* プレビュー */}
          <div className="w-1/2 p-6 bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
            <AvatarPreview avatar={tempAvatar} size="large" />
          </div>

          {/* カスタマイズオプション */}
          <div className="w-1/2 flex flex-col">
            {/* カテゴリータブ */}
            <div className="flex border-b bg-gray-50">
              {Object.entries({
                hairStyle: '髪型',
                hairColor: '髪色', 
                eyeColor: '瞳色',
                outfit: '服装',
                accessories: 'アクセサリー',
              }).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as keyof typeof AVATAR_OPTIONS)}
                  className={`flex-1 py-3 text-sm font-medium ${
                    selectedCategory === key
                      ? 'border-b-2 border-pink-500 text-pink-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* オプション一覧 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {AVATAR_OPTIONS[selectedCategory].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(selectedCategory, option.id)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedCategory === 'accessories' 
                        ? (tempAvatar.accessories?.includes(option.id) || (option.id === 'none' && (!tempAvatar.accessories || tempAvatar.accessories.length === 0)))
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : tempAvatar[selectedCategory] === option.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${!option.free ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">
                        {selectedCategory === 'hairColor' || selectedCategory === 'eyeColor' 
                          ? '●' 
                          : option.emoji || '👤'}
                      </span>
                      {!option.free && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          有料
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-800">{option.name}</div>
                    {(selectedCategory === 'hairColor' || selectedCategory === 'eyeColor') && 'color' in option && (
                      <div 
                        className="w-full h-4 rounded mt-2 border border-gray-200"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};