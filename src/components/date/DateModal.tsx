import React, { useState } from 'react';
import { Heart, X, MapPin } from 'lucide-react';

interface DateModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
}

const dateSpots = [
  {
    id: '1',
    name: '映画館',
    description: '最新の映画を一緒に見よう！',
    mood: '🎬',
    scenarios: [
      'どの映画見る？ホラーは苦手だから、恋愛映画がいいな💕',
      'ポップコーン買おう！塩味とキャラメル、どっちがいい？',
      '隣に座ってると、映画より君のことが気になっちゃう😊',
    ],
  },
  {
    id: '2', 
    name: 'カフェ',
    description: 'おしゃれなカフェでゆっくりお話',
    mood: '☕',
    scenarios: [
      'このカフェのケーキ、すごく美味しそう！シェアしない？',
      '窓際の席で、外の景色を見ながらのんびり過ごそう',
      'ラテアート可愛い〜♪ 写真撮らせて！',
    ],
  },
  {
    id: '3',
    name: '公園',
    description: '自然の中でのんびりデート',
    mood: '🌳',
    scenarios: [
      'ベンチに座って、雲の形でも眺めてよう☁️',
      '池にいるカモが可愛い！パン持ってくればよかったな',
      '芝生の上でピクニックっていうのもいいよね🧺',
    ],
  },
  {
    id: '4',
    name: '遊園地',
    description: '一日中楽しめるテーマパーク！',
    mood: '🎡',
    scenarios: [
      'ジェットコースター、一緒に乗ろう！怖かったら手を握っててもいいからね',
      'コットンキャンディー食べよう！君の好きな色は？',
      '観覧車の上から見る景色、きれいだね✨',
    ],
  },
];

export const DateModal: React.FC<DateModalProps> = ({ isOpen, onClose, characterName }) => {
  const [selectedSpot, setSelectedSpot] = useState<typeof dateSpots[0] | null>(null);
  const [currentScenario, setCurrentScenario] = useState(0);

  if (!isOpen) return null;

  const startDate = (spot: typeof dateSpots[0]) => {
    setSelectedSpot(spot);
    setCurrentScenario(0);
  };

  const nextScenario = () => {
    if (selectedSpot && currentScenario < selectedSpot.scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      // デート終了
      setSelectedSpot(null);
      onClose();
    }
  };

  const renderDateSpotList = () => (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">デートスポットを選んでね</h3>
      <div className="grid grid-cols-1 gap-3">
        {dateSpots.map(spot => (
          <button
            key={spot.id}
            onClick={() => startDate(spot)}
            className="text-left p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{spot.mood}</span>
              <div>
                <h4 className="font-medium">{spot.name}</h4>
                <p className="text-sm text-gray-500">{spot.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDateScenario = () => (
    <div className="p-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{selectedSpot?.mood}</div>
        <h3 className="text-lg font-semibold flex items-center justify-center">
          <MapPin size={16} className="mr-1" />
          {selectedSpot?.name}でデート中
        </h3>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {characterName.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm leading-relaxed">
              {selectedSpot?.scenarios[currentScenario]}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={nextScenario}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          {currentScenario < (selectedSpot?.scenarios.length || 0) - 1 ? '次のシーン' : 'デート終了'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Heart size={20} className="text-pink-500" />
            <h2 className="text-lg font-semibold">デート</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {selectedSpot ? renderDateScenario() : renderDateSpotList()}
      </div>
    </div>
  );
};