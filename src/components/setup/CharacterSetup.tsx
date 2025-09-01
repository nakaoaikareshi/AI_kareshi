import React, { useState } from 'react';
import { Character, CharacterPersonality } from '@/types';
import { useCharacterStore } from '@/store/characterStore';

const personalityPresets = {
  gentle: { kindness: 90, humor: 60, seriousness: 70, activeness: 50, empathy: 85 },
  funny: { kindness: 70, humor: 95, seriousness: 30, activeness: 80, empathy: 60 },
  serious: { kindness: 60, humor: 30, seriousness: 95, activeness: 60, empathy: 70 },
  energetic: { kindness: 75, humor: 80, seriousness: 40, activeness: 95, empathy: 65 },
  caring: { kindness: 95, humor: 50, seriousness: 75, activeness: 60, empathy: 95 },
};

export const CharacterSetup: React.FC = () => {
  const { setCharacter } = useCharacterStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    gender: 'boyfriend' as 'boyfriend' | 'girlfriend',
    age: 25,
    occupation: '',
    hobbies: [] as string[],
    personality: {
      kindness: 70,
      humor: 70,
      seriousness: 70,
      activeness: 70,
      empathy: 70,
    } as CharacterPersonality,
  });

  const hobbyOptions = [
    '映画鑑賞', 'ゲーム', '読書', '料理', 'スポーツ', '音楽',
    'アニメ', 'カラオケ', '散歩', '写真', 'ショッピング', '旅行', 'グルメ'
  ];

  const handlePersonalityChange = (key: keyof CharacterPersonality, value: number) => {
    setFormData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        [key]: value,
      },
    }));
  };

  const applyPreset = (preset: keyof typeof personalityPresets) => {
    setFormData(prev => ({
      ...prev,
      personality: personalityPresets[preset],
    }));
  };

  const toggleHobby = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby],
    }));
  };

  const handleSubmit = () => {
    const newCharacter: Character = {
      id: crypto.randomUUID(),
      ...formData,
    };
    setCharacter(newCharacter);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">基本情報を設定</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">本名</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="AI恋人の本名を入力"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">呼び名</label>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="普段呼ぶ名前（例：太郎くん、花子ちゃん）"
        />
        <p className="text-xs text-gray-500 mt-1">
          チャット画面でこの名前が表示されます
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">性別</label>
        <div className="flex space-x-4">
          {[
            { value: 'boyfriend', label: '彼氏' },
            { value: 'girlfriend', label: '彼女' },
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, gender: option.value as 'boyfriend' | 'girlfriend' }))}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                formData.gender === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">年齢</label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="18"
          max="40"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">職業</label>
        <input
          type="text"
          value={formData.occupation}
          onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例：大学生、会社員、教師"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">趣味を選択</h2>
      
      <div>
        <label className="block text-sm font-medium mb-3">
          趣味・好きなこと（複数選択可）
        </label>
        <div className="grid grid-cols-2 gap-3">
          {hobbyOptions.map(hobby => (
            <button
              key={hobby}
              type="button"
              onClick={() => toggleHobby(hobby)}
              className={`py-2 px-3 rounded-lg border-2 transition-colors text-sm ${
                formData.hobbies.includes(hobby)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {hobby}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">性格を設定</h2>
      
      {/* Presets */}
      <div>
        <label className="block text-sm font-medium mb-3">性格プリセット</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries({
            gentle: '優しい',
            funny: '面白い',
            serious: '真面目',
            energetic: '元気',
            caring: '思いやり',
          }).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key as keyof typeof personalityPresets)}
              className="py-2 px-3 rounded-lg border border-gray-300 hover:border-gray-400 text-sm transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom sliders */}
      <div className="space-y-4">
        <h3 className="font-medium">カスタム設定</h3>
        {Object.entries({
          kindness: '優しさ',
          humor: '面白さ',
          seriousness: '真面目さ',
          activeness: '積極性',
          empathy: '共感力',
        }).map(([key, label]) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium">{label}</label>
              <span className="text-sm text-gray-500">
                {formData.personality[key as keyof CharacterPersonality]}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.personality[key as keyof CharacterPersonality]}
              onChange={(e) => handlePersonalityChange(
                key as keyof CharacterPersonality, 
                parseInt(e.target.value)
              )}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${formData.personality[key as keyof CharacterPersonality]}%, #e5e7eb ${formData.personality[key as keyof CharacterPersonality]}%, #e5e7eb 100%)`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map(num => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full ${
                  num <= step ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              戻る
            </button>
          )}
          
          <div className="flex-1" />
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!formData.name.trim() || !formData.nickname.trim())}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              完了
            </button>
          )}
        </div>
      </div>
    </div>
  );
};