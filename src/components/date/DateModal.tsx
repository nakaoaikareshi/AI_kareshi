import React, { useState, useEffect } from 'react';
import { Heart, X, MapPin, Clock, DollarSign, Calendar, Star } from 'lucide-react';
import { 
  dateSpots, 
  suggestDateSpots, 
  createDatePlan, 
  generateDateMessage,
  createDateMemory,
  DateSpot,
  DatePlan 
} from '@/utils/dateSystem';
import { useDateStore } from '@/store/dateStore';
import { useCharacterStore } from '@/store/characterStore';
import { useChatStore } from '@/store/chatStore';

interface DateModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
}

// タブの種類
type TabType = 'suggest' | 'all' | 'history' | 'favorite';

export const DateModal: React.FC<DateModalProps> = ({ isOpen, onClose, characterName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('suggest');
  const [selectedSpots, setSelectedSpots] = useState<DateSpot[]>([]);
  const [currentDatePlan, setCurrentDatePlan] = useState<DatePlan | null>(null);
  const [currentSpotIndex, setCurrentSpotIndex] = useState(0);
  const [suggestedSpots, setSuggestedSpots] = useState<DateSpot[]>([]);
  const [budget, setBudget] = useState(5000);
  
  const { character } = useCharacterStore();
  const { addMessage } = useChatStore();
  const {
    startDate,
    endDate,
    addMemory,
    favoriteSpots,
    addFavoriteSpot,
    removeFavoriteSpot,
    dateHistory,
    totalDatesCount
  } = useDateStore();

  // 初回表示時におすすめスポットを生成
  useEffect(() => {
    if (isOpen) {
      const suggestions = suggestDateSpots(budget);
      setSuggestedSpots(suggestions);
    }
  }, [isOpen, budget]);

  if (!isOpen) return null;

  const handleStartDate = () => {
    if (selectedSpots.length === 0) return;
    
    const plan = createDatePlan(selectedSpots);
    setCurrentDatePlan(plan);
    startDate(plan);
    setCurrentSpotIndex(0);
    
    // 最初のメッセージを送信
    const firstSpot = selectedSpots[0];
    const message = generateDateMessage(firstSpot, characterName, 'excited');
    addMessage({
      senderId: character?.id || 'ai',
      content: message,
      type: 'text',
      isRead: false,
      isUser: false,
    });
  };

  const handleNextSpot = () => {
    if (!currentDatePlan || !character) return;
    
    // 現在のスポットの思い出を記録
    const currentSpot = currentDatePlan.spots[currentSpotIndex];
    const emotions = ['happy', 'excited', 'romantic', 'fun', 'relaxed'] as const;
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const memory = createDateMemory(currentSpot, emotion);
    addMemory(memory);
    
    if (currentSpotIndex < currentDatePlan.spots.length - 1) {
      // 次のスポットへ
      const nextIndex = currentSpotIndex + 1;
      setCurrentSpotIndex(nextIndex);
      
      const nextSpot = currentDatePlan.spots[nextIndex];
      const message = generateDateMessage(nextSpot, characterName, emotion);
      addMessage({
        senderId: character.id,
        content: message,
        type: 'text',
        isRead: false,
        isUser: false,
      });
    } else {
      // デート終了
      endDate();
      addMessage({
        senderId: character.id,
        content: `今日はすごく楽しかった！また一緒に出かけようね💕`,
        type: 'text',
        isRead: false,
        isUser: false,
      });
      setCurrentDatePlan(null);
      setSelectedSpots([]);
      onClose();
    }
  };

  const toggleSpotSelection = (spot: DateSpot) => {
    setSelectedSpots(prev => {
      const isSelected = prev.some(s => s.id === spot.id);
      if (isSelected) {
        return prev.filter(s => s.id !== spot.id);
      } else {
        return [...prev, spot].slice(0, 3); // 最大3つまで
      }
    });
  };

  const toggleFavorite = (spotId: string) => {
    if (favoriteSpots.includes(spotId)) {
      removeFavoriteSpot(spotId);
    } else {
      addFavoriteSpot(spotId);
    }
  };

  const renderSpotCard = (spot: DateSpot) => {
    const isSelected = selectedSpots.some(s => s.id === spot.id);
    const isFavorite = favoriteSpots.includes(spot.id);
    
    return (
      <div
        key={spot.id}
        className={`relative p-4 border-2 rounded-lg transition-all cursor-pointer ${
          isSelected 
            ? 'border-pink-500 bg-pink-50' 
            : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
        }`}
        onClick={() => toggleSpotSelection(spot)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(spot.id);
          }}
          className="absolute top-2 right-2 p-1 hover:scale-110 transition-transform"
        >
          <Star
            size={20}
            className={isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}
          />
        </button>
        
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{spot.emoji}</span>
          <div className="flex-1">
            <h4 className="font-medium">{spot.name}</h4>
            <p className="text-sm text-gray-500 mb-2">{spot.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span className="flex items-center">
                <DollarSign size={12} className="mr-1" />
                {spot.cost.toLocaleString()}円
              </span>
              <span className="flex items-center">
                <Clock size={12} className="mr-1" />
                {spot.duration}分
              </span>
            </div>
          </div>
        </div>
        
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {selectedSpots.findIndex(s => s.id === spot.id) + 1}
          </div>
        )}
      </div>
    );
  };

  const renderOngoingDate = () => {
    if (!currentDatePlan) return null;
    const currentSpot = currentDatePlan.spots[currentSpotIndex];
    
    return (
      <div className="p-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{currentSpot.emoji}</div>
          <h3 className="text-lg font-semibold flex items-center justify-center">
            <MapPin size={16} className="mr-1" />
            {currentSpot.name}でデート中
          </h3>
          <div className="text-sm text-gray-500 mt-1">
            {currentSpotIndex + 1} / {currentDatePlan.spots.length} スポット
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {characterName.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed">
                {currentSpot.name}楽しい！一緒にいられて嬉しい💕
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* 現在のスポット情報 */}
          <div className="bg-white border rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">所要時間</span>
              <span className="font-medium">{currentSpot.duration}分</span>
            </div>
          </div>
          
          <button
            onClick={handleNextSpot}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            {currentSpotIndex < currentDatePlan.spots.length - 1 
              ? '次のスポットへ' 
              : 'デートを終了'}
          </button>
        </div>
      </div>
    );
  };

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

        {currentDatePlan ? (
          renderOngoingDate()
        ) : (
          <>
            {/* タブ */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('suggest')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'suggest'
                    ? 'border-b-2 border-pink-500 text-pink-600'
                    : 'text-gray-500'
                }`}
              >
                おすすめ
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'border-b-2 border-pink-500 text-pink-600'
                    : 'text-gray-500'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setActiveTab('favorite')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'favorite'
                    ? 'border-b-2 border-pink-500 text-pink-600'
                    : 'text-gray-500'
                }`}
              >
                ★お気に入り
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'history'
                    ? 'border-b-2 border-pink-500 text-pink-600'
                    : 'text-gray-500'
                }`}
              >
                履歴
              </button>
            </div>
            
            <div className="p-4">
              {/* 予算設定 */}
              {activeTab !== 'history' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    予算: {budget.toLocaleString()}円
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    step="1000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* コンテンツ */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeTab === 'suggest' && suggestedSpots.map(renderSpotCard)}
                {activeTab === 'all' && dateSpots.map(renderSpotCard)}
                {activeTab === 'favorite' && 
                  dateSpots.filter(s => favoriteSpots.includes(s.id)).map(renderSpotCard)
                }
                {activeTab === 'history' && (
                  <div>
                    <div className="text-sm text-gray-600 mb-3">
                      今までのデート回数: {totalDatesCount}回
                    </div>
                    {dateHistory.slice(-5).reverse().map((plan, index) => (
                      <div key={plan.id} className="border rounded-lg p-3 mb-2">
                        <div className="text-sm font-medium mb-1">
                          デート{dateHistory.length - index}
                        </div>
                        <div className="text-xs text-gray-600">
                          {plan.spots.map(s => s.emoji).join(' ')}
                          {plan.spots.map(s => s.name).join(' → ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 選択中のスポット表示 */}
              {selectedSpots.length > 0 && activeTab !== 'history' && (
                <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">
                    選択中のスポット ({selectedSpots.length}/3)
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    {selectedSpots.map(spot => (
                      <span key={spot.id} className="text-2xl">
                        {spot.emoji}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>合計: {selectedSpots.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}円</span>
                    <span>{selectedSpots.reduce((sum, s) => sum + s.duration, 0)}分</span>
                  </div>
                  <button
                    onClick={handleStartDate}
                    className="w-full mt-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    デートを始める
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};