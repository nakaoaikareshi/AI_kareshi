import React, { useState } from 'react';
import { Camera, Heart, Calendar, X } from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'chat' | 'date' | 'gift' | 'special';
  imageUrl?: string;
  content: string;
}

interface MemoryAlbumProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
}

const mockMemories: Memory[] = [
  {
    id: '1',
    title: '初めての会話',
    description: '出会った記念すべき日',
    date: new Date(),
    type: 'chat',
    content: '今日から一緒だね💕',
  },
  {
    id: '2', 
    title: '映画デート',
    description: '一緒に映画を見た思い出',
    date: new Date(Date.now() - 86400000),
    type: 'date',
    content: '楽しい映画デートだったね🎬',
  },
  {
    id: '3',
    title: 'プレゼント',
    description: 'バラの花をもらった日',
    date: new Date(Date.now() - 172800000),
    type: 'gift',
    content: '🌹 きれいなバラをありがとう',
  },
];

export const MemoryAlbum: React.FC<MemoryAlbumProps> = ({ 
  isOpen, 
  onClose, 
  characterName 
}) => {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  if (!isOpen) return null;

  const getTypeIcon = (type: Memory['type']) => {
    switch (type) {
      case 'chat': return '💬';
      case 'date': return '💕';
      case 'gift': return '🎁';
      case 'special': return '✨';
      default: return '📸';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderMemoryDetail = () => (
    <div className="p-4">
      <button
        onClick={() => setSelectedMemory(null)}
        className="mb-4 text-blue-500 hover:text-blue-600 text-sm"
      >
        ← 思い出一覧に戻る
      </button>
      
      <div className="text-center">
        <div className="text-4xl mb-3">{getTypeIcon(selectedMemory!.type)}</div>
        <h3 className="text-lg font-semibold mb-2">{selectedMemory!.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{selectedMemory!.description}</p>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <p className="text-sm leading-relaxed">{selectedMemory!.content}</p>
        </div>
        
        <div className="flex items-center justify-center text-gray-500 text-xs">
          <Calendar size={12} className="mr-1" />
          {formatDate(selectedMemory!.date)}
        </div>
      </div>
    </div>
  );

  const renderMemoryList = () => (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3">
        {mockMemories.map(memory => (
          <button
            key={memory.id}
            onClick={() => setSelectedMemory(memory)}
            className="text-left p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getTypeIcon(memory.type)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{memory.title}</h4>
                <p className="text-xs text-gray-500 mb-1">{memory.description}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar size={10} className="mr-1" />
                  {formatDate(memory.date)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {mockMemories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Camera size={48} className="mx-auto mb-3 text-gray-300" />
          <p>まだ思い出がありません</p>
          <p className="text-sm">たくさん話して思い出を作りましょう💕</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Camera size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold">{characterName}との思い出</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {selectedMemory ? renderMemoryDetail() : renderMemoryList()}
      </div>
    </div>
  );
};