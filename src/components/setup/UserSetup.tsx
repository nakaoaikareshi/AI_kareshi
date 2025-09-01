import React, { useState } from 'react';
import { User } from '@/types';
import { useUserStore } from '@/store/userStore';

export const UserSetup: React.FC = () => {
  const { setUser } = useUserStore();
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
  });

  const handleSubmit = () => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email: '',
      name: formData.name,
      nickname: formData.nickname,
      createdAt: new Date(),
      characters: [],
    };
    setUser(newUser);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">あなたの情報を教えてください</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">お名前</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="あなたの本名を入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">呼び名</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="相手に呼んでもらいたい名前"
            />
            <p className="text-xs text-gray-500 mt-1">
              例：まみ、真実ちゃん、まーちゃん など
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim() || !formData.nickname.trim()}
          className="w-full mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次へ進む
        </button>
      </div>
    </div>
  );
};