import React, { useState } from 'react';
import { Calendar, Plus, X, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'date' | 'reminder' | 'anniversary' | 'meeting';
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: '映画デートの約束',
    date: new Date(Date.now() + 86400000),
    time: '19:00',
    type: 'date',
  },
  {
    id: '2',
    title: '一緒にお買い物',
    date: new Date(Date.now() + 172800000),
    time: '14:00', 
    type: 'date',
  },
  {
    id: '3',
    title: '出会った記念日',
    date: new Date(Date.now() + 2592000000),
    time: '00:00',
    type: 'anniversary',
  },
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  characterName 
}) => {
  const [events, setEvents] = useState(mockEvents);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '12:00',
    type: 'reminder' as Event['type'],
  });

  if (!isOpen) return null;

  const getTypeIcon = (type: Event['type']) => {
    switch (type) {
      case 'date': return '💕';
      case 'reminder': return '⏰';
      case 'anniversary': return '🎉';
      case 'meeting': return '📅';
      default: return '📝';
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    
    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明日';
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    
    const event: Event = {
      id: crypto.randomUUID(),
      title: newEvent.title,
      date: new Date(newEvent.date + 'T' + newEvent.time),
      time: newEvent.time,
      type: newEvent.type,
    };
    
    setEvents(prev => [...prev, event].sort((a, b) => a.date.getTime() - b.date.getTime()));
    setNewEvent({ title: '', date: '', time: '12:00', type: 'reminder' });
    setShowAddForm(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold">{characterName}との予定</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">今後の予定</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm"
            >
              <Plus size={16} />
              <span>追加</span>
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3">新しい予定</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="予定のタイトル"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="reminder">リマインダー</option>
                  <option value="date">デート</option>
                  <option value="anniversary">記念日</option>
                  <option value="meeting">約束</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={addEvent}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border rounded-lg text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    <span className="text-lg">{getTypeIcon(event.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>{formatDate(event.date)}</span>
                        <Clock size={10} />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
            
            {events.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                <p>予定がありません</p>
                <p className="text-sm">一緒の時間を計画しましょう💕</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};