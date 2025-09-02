import React, { useState } from 'react';
import { Smile, Heart, Coffee, Cat, Sun, Gift } from 'lucide-react';

interface StickerPickerProps {
  onStickerSelect: (sticker: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const STICKER_CATEGORIES = {
  emotions: {
    icon: <Smile size={20} />,
    name: '感情',
    stickers: ['😊', '😄', '😍', '🥰', '😘', '😋', '😆', '🤗', '😌', '😔', '😢', '😭', '😤', '😡', '🥺', '😳']
  },
  hearts: {
    icon: <Heart size={20} />,
    name: 'ハート',
    stickers: ['❤️', '💕', '💖', '💗', '💓', '💞', '💝', '💘', '💟', '♥️', '🧡', '💛', '💚', '💙', '💜', '🤍']
  },
  everyday: {
    icon: <Coffee size={20} />,
    name: '日常',
    stickers: ['☕', '🍽️', '🍱', '🎂', '🍰', '🍦', '🛁', '🛏️', '📱', '💻', '📚', '🎵', '🎮', '🛍️', '🏠', '🚗']
  },
  animals: {
    icon: <Cat size={20} />,
    name: '動物',
    stickers: ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐸', '🐧', '🐯', '🦁', '🐨', '🐵', '🐹', '🐭', '🦄', '🐾']
  },
  weather: {
    icon: <Sun size={20} />,
    name: '天気',
    stickers: ['☀️', '🌙', '⭐', '🌟', '✨', '🌈', '☁️', '🌧️', '⛈️', '❄️', '☂️', '🌸', '🍁', '🌺', '🌻', '🌷']
  },
  special: {
    icon: <Gift size={20} />,
    name: '特別',
    stickers: ['🎉', '🎊', '🎁', '🎈', '🎀', '👑', '💎', '🌹', '💐', '🎪', '🎭', '🎨', '🎯', '🏆', '🎓', '🎪']
  }
};

export const StickerPicker: React.FC<StickerPickerProps> = ({ onStickerSelect, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof STICKER_CATEGORIES>('emotions');

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-3">
        {/* カテゴリータブ */}
        <div className="flex space-x-1 mb-3 bg-gray-100 rounded-lg p-1">
          {Object.entries(STICKER_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as keyof typeof STICKER_CATEGORIES)}
              className={`flex-1 p-2 rounded-md flex items-center justify-center transition-colors ${
                selectedCategory === key
                  ? 'bg-white shadow-sm text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
        </div>

        {/* スティッカーグリッド */}
        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
          {STICKER_CATEGORIES[selectedCategory].stickers.map((sticker, index) => (
            <button
              key={index}
              onClick={() => {
                onStickerSelect(sticker);
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors text-xl"
            >
              {sticker}
            </button>
          ))}
        </div>

        {/* 閉じるボタン */}
        <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};