'use client';

import React, { useState } from 'react';
import { X, Image, Home, Palette } from 'lucide-react';
import { useBackgroundStore } from '@/store/backgroundStore';

interface BackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// プリセット背景の定義
const presetBackgrounds = [
  { id: 'bedroom', name: '寝室', preview: '🛏️', color: '#FFF5F5' },
  { id: 'living', name: 'リビング', preview: '🛋️', color: '#F5F5FF' },
  { id: 'cafe', name: 'カフェ', preview: '☕', color: '#FFF9F0' },
  { id: 'park', name: '公園', preview: '🌳', color: '#F0FFF0' },
  { id: 'beach', name: 'ビーチ', preview: '🏖️', color: '#F0FFFF' },
  { id: 'city', name: '街中', preview: '🏙️', color: '#F5F5F5' },
  { id: 'school', name: '学校', preview: '🏫', color: '#FFFAF0' },
  { id: 'library', name: '図書館', preview: '📚', color: '#FAF5FF' },
];

// 床タイプの定義
const floorTypes = [
  { type: 'wood' as const, name: 'フローリング', color: '#8B4513' },
  { type: 'carpet' as const, name: 'カーペット', color: '#696969' },
  { type: 'tile' as const, name: 'タイル', color: '#E0E0E0' },
];

// 照明タイプの定義
const lightingTypes = [
  { type: 'warm' as const, name: '暖色', color: '#FFE4B5' },
  { type: 'cool' as const, name: '寒色', color: '#E0F2FF' },
  { type: 'natural' as const, name: '自然光', color: '#FFFFFF' },
];

export const BackgroundModal: React.FC<BackgroundModalProps> = ({ isOpen, onClose }) => {
  const { 
    background, 
    setPresetBackground, 
    setBackgroundType,
    updateRoomWallColor,
    updateRoomFloorType,
    updateRoomLighting
  } = useBackgroundStore();
  
  const [activeTab, setActiveTab] = useState<'preset' | 'room'>('preset');
  const [wallColor, setWallColor] = useState(background.roomConfig?.wallColor || '#F5F5F5');

  if (!isOpen) return null;

  const handleWallColorChange = (color: string) => {
    setWallColor(color);
    updateRoomWallColor(color);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">背景設定</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'preset' 
                ? 'border-b-2 border-purple-500 text-purple-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Image size={18} />
            <span>プリセット背景</span>
          </button>
          <button
            onClick={() => setActiveTab('room')}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'room' 
                ? 'border-b-2 border-purple-500 text-purple-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home size={18} />
            <span>部屋カスタマイズ</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'preset' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">背景を選択</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {presetBackgrounds.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setPresetBackground(preset.id);
                      setBackgroundType('preset');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                      background.type === 'preset' && background.presetId === preset.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    style={{ backgroundColor: preset.color }}
                  >
                    <div className="text-3xl mb-2">{preset.preview}</div>
                    <div className="text-sm font-medium">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'room' && (
            <div className="space-y-6">
              {/* 壁の色 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Palette className="mr-2" size={20} />
                  壁の色
                </h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={wallColor}
                    onChange={(e) => handleWallColorChange(e.target.value)}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={wallColor}
                    onChange={(e) => handleWallColorChange(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                    placeholder="#FFFFFF"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleWallColorChange('#FFFFFF')}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: '#FFFFFF' }}
                    />
                    <button
                      onClick={() => handleWallColorChange('#FFF5F5')}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: '#FFF5F5' }}
                    />
                    <button
                      onClick={() => handleWallColorChange('#F5F5FF')}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: '#F5F5FF' }}
                    />
                    <button
                      onClick={() => handleWallColorChange('#F0FFF0')}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: '#F0FFF0' }}
                    />
                  </div>
                </div>
              </div>

              {/* 床タイプ */}
              <div>
                <h3 className="text-lg font-semibold mb-3">床タイプ</h3>
                <div className="grid grid-cols-3 gap-3">
                  {floorTypes.map((floor) => (
                    <button
                      key={floor.type}
                      onClick={() => {
                        updateRoomFloorType(floor.type);
                        setBackgroundType('room');
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        background.roomConfig?.floorType === floor.type
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded mb-2"
                        style={{ backgroundColor: floor.color }}
                      />
                      <div className="text-sm font-medium">{floor.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 照明 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">照明</h3>
                <div className="grid grid-cols-3 gap-3">
                  {lightingTypes.map((lighting) => (
                    <button
                      key={lighting.type}
                      onClick={() => {
                        updateRoomLighting(lighting.type);
                        setBackgroundType('room');
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        background.roomConfig?.lighting === lighting.type
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded mb-2"
                        style={{ backgroundColor: lighting.color }}
                      />
                      <div className="text-sm font-medium">{lighting.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* プレビューボタン */}
              <div className="pt-4 border-t">
                <button
                  onClick={() => setBackgroundType('room')}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  部屋の背景を適用
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};