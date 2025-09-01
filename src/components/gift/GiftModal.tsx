import React, { useState } from 'react';
import { Gift, X, Heart } from 'lucide-react';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  onGiftSent: (gift: string) => void;
}

const giftOptions = [
  { emoji: '🌹', name: 'バラの花', message: 'きれいなバラをあなたに💕' },
  { emoji: '🍫', name: 'チョコレート', message: '甘いチョコレート、一緒に食べよう' },
  { emoji: '🧸', name: 'テディベア', message: '可愛いクマさん、抱きしめてね' },
  { emoji: '☕', name: 'コーヒー', message: '美味しいコーヒーでほっと一息' },
  { emoji: '📚', name: '本', message: '面白そうな本を見つけたよ' },
  { emoji: '🎵', name: 'CD', message: '好きなアーティストの新作だよ' },
  { emoji: '🍰', name: 'ケーキ', message: '美味しいケーキでお祝いしよう' },
  { emoji: '💍', name: 'アクセサリー', message: 'きれいなアクセサリー見つけた✨' },
];

export const GiftModal: React.FC<GiftModalProps> = ({ 
  isOpen, 
  onClose, 
  characterName,
  onGiftSent 
}) => {
  const [selectedGift, setSelectedGift] = useState<typeof giftOptions[0] | null>(null);

  if (!isOpen) return null;

  const sendGift = (gift: typeof giftOptions[0]) => {
    onGiftSent(`${gift.emoji} ${gift.message}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Gift size={20} className="text-pink-500" />
            <h2 className="text-lg font-semibold">{characterName}にプレゼント</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {giftOptions.map((gift, index) => (
              <button
                key={index}
                onClick={() => sendGift(gift)}
                className="p-4 border rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors text-center"
              >
                <div className="text-3xl mb-2">{gift.emoji}</div>
                <div className="text-sm font-medium">{gift.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600">
          プレゼントを選んで送ってみてね💕
        </div>
      </div>
    </div>
  );
};