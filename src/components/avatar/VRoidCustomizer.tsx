import React, { useState, useRef, useEffect } from 'react';
import { X, Sliders, Palette, Eye, Shirt, User, Download, Upload, RotateCcw, Save } from 'lucide-react';
import { AvatarSettings } from '@/types';
import { VRMAvatar } from './VRMAvatar';
import { HexColorPicker, HexColorInput } from 'react-colorful';

interface VRoidCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: AvatarSettings;
  onAvatarUpdate: (avatar: AvatarSettings) => void;
}

// カスタマイズカテゴリ
type CustomCategory = 'face' | 'hair' | 'body' | 'outfit' | 'accessories';

// 詳細なカスタマイズパラメータ
interface DetailedCustomization {
  // 顔の詳細
  faceWidth: number; // 0-100
  faceHeight: number; // 0-100
  jawWidth: number; // 0-100
  chinHeight: number; // 0-100
  cheekWidth: number; // 0-100
  
  // 目の詳細
  eyeSize: number; // 0-100
  eyeSpacing: number; // 0-100
  eyeAngle: number; // -50 to 50
  eyeHeight: number; // 0-100
  pupilSize: number; // 0-100
  
  // 眉毛の詳細
  eyebrowHeight: number; // 0-100
  eyebrowAngle: number; // -50 to 50
  eyebrowThickness: number; // 0-100
  eyebrowLength: number; // 0-100
  
  // 鼻の詳細
  noseSize: number; // 0-100
  noseWidth: number; // 0-100
  noseHeight: number; // 0-100
  nostrilSize: number; // 0-100
  
  // 口の詳細
  mouthSize: number; // 0-100
  mouthWidth: number; // 0-100
  lipThickness: number; // 0-100
  mouthHeight: number; // 0-100
  
  // 髪の詳細
  hairLength: number; // 0-100
  hairVolume: number; // 0-100
  hairCurl: number; // 0-100
  bangsLength: number; // 0-100
  sideHairLength: number; // 0-100
  
  // 体型の詳細
  bustSize: number; // 0-100 (女性キャラのみ)
  waistSize: number; // 0-100
  hipSize: number; // 0-100
  shoulderWidth: number; // 0-100
  armThickness: number; // 0-100
  legThickness: number; // 0-100
  heightScale: number; // 80-120 (%)
}

const defaultCustomization: DetailedCustomization = {
  // 顔
  faceWidth: 50,
  faceHeight: 50,
  jawWidth: 50,
  chinHeight: 50,
  cheekWidth: 50,
  
  // 目
  eyeSize: 50,
  eyeSpacing: 50,
  eyeAngle: 0,
  eyeHeight: 50,
  pupilSize: 50,
  
  // 眉毛
  eyebrowHeight: 50,
  eyebrowAngle: 0,
  eyebrowThickness: 50,
  eyebrowLength: 50,
  
  // 鼻
  noseSize: 50,
  noseWidth: 50,
  noseHeight: 50,
  nostrilSize: 50,
  
  // 口
  mouthSize: 50,
  mouthWidth: 50,
  lipThickness: 50,
  mouthHeight: 50,
  
  // 髪
  hairLength: 50,
  hairVolume: 50,
  hairCurl: 0,
  bangsLength: 50,
  sideHairLength: 50,
  
  // 体型
  bustSize: 50,
  waistSize: 50,
  hipSize: 50,
  shoulderWidth: 50,
  armThickness: 50,
  legThickness: 50,
  heightScale: 100,
};

// スライダーコンポーネント
const CustomSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}> = ({ label, value, min, max, onChange, unit = '' }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-600">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #ec4899 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%)`
        }}
      />
    </div>
  );
};

export const VRoidCustomizer: React.FC<VRoidCustomizerProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarUpdate,
}) => {
  const [activeCategory, setActiveCategory] = useState<CustomCategory>('face');
  const [tempAvatar, setTempAvatar] = useState<AvatarSettings>(currentAvatar);
  const [customization, setCustomization] = useState<DetailedCustomization>(defaultCustomization);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [colorTarget, setColorTarget] = useState<'hair' | 'eyes' | 'skin'>('hair');
  
  // プリセット
  const [presets] = useState([
    { name: 'デフォルト', data: defaultCustomization },
    { name: 'かわいい系', data: { ...defaultCustomization, eyeSize: 70, chinHeight: 40, cheekWidth: 60 } },
    { name: 'クール系', data: { ...defaultCustomization, eyeSize: 40, eyeAngle: 20, jawWidth: 60 } },
    { name: 'セクシー系', data: { ...defaultCustomization, bustSize: 70, waistSize: 40, hipSize: 60 } },
  ]);

  if (!isOpen) return null;

  const handleCustomizationChange = (key: keyof DetailedCustomization, value: number) => {
    setCustomization(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (colorTarget === 'hair') {
      setTempAvatar(prev => ({ ...prev, hairColor: color }));
    } else if (colorTarget === 'eyes') {
      setTempAvatar(prev => ({ ...prev, eyeColor: color }));
    } else if (colorTarget === 'skin') {
      setTempAvatar(prev => ({ ...prev, skinTone: color }));
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setCustomization(preset.data);
  };

  const handleSave = () => {
    // カスタマイズデータをVRMモデルに適用する処理
    // ここで実際のVRMモデルのパラメータに変換
    const updatedAvatar = {
      ...tempAvatar,
      // カスタマイズデータを含める
      customData: JSON.stringify(customization)
    };
    onAvatarUpdate(updatedAvatar);
    onClose();
  };

  const handleReset = () => {
    setCustomization(defaultCustomization);
    setTempAvatar(currentAvatar);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ avatar: tempAvatar, customization }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'avatar-customization.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.avatar) setTempAvatar(data.avatar);
        if (data.customization) setCustomization(data.customization);
      } catch (error) {
        alert('ファイルの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
  };

  // カテゴリごとのコントロール
  const renderCategoryControls = () => {
    switch (activeCategory) {
      case 'face':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 mb-3">顔の形</h3>
            <CustomSlider label="顔の幅" value={customization.faceWidth} min={0} max={100} onChange={(v) => handleCustomizationChange('faceWidth', v)} />
            <CustomSlider label="顔の縦幅" value={customization.faceHeight} min={0} max={100} onChange={(v) => handleCustomizationChange('faceHeight', v)} />
            <CustomSlider label="顎の幅" value={customization.jawWidth} min={0} max={100} onChange={(v) => handleCustomizationChange('jawWidth', v)} />
            <CustomSlider label="顎の高さ" value={customization.chinHeight} min={0} max={100} onChange={(v) => handleCustomizationChange('chinHeight', v)} />
            <CustomSlider label="頬の幅" value={customization.cheekWidth} min={0} max={100} onChange={(v) => handleCustomizationChange('cheekWidth', v)} />
            
            <h3 className="font-medium text-gray-900 mb-3 mt-6">目</h3>
            <CustomSlider label="目の大きさ" value={customization.eyeSize} min={0} max={100} onChange={(v) => handleCustomizationChange('eyeSize', v)} />
            <CustomSlider label="目の間隔" value={customization.eyeSpacing} min={0} max={100} onChange={(v) => handleCustomizationChange('eyeSpacing', v)} />
            <CustomSlider label="目の角度" value={customization.eyeAngle} min={-50} max={50} onChange={(v) => handleCustomizationChange('eyeAngle', v)} />
            <CustomSlider label="目の高さ" value={customization.eyeHeight} min={0} max={100} onChange={(v) => handleCustomizationChange('eyeHeight', v)} />
            <CustomSlider label="瞳の大きさ" value={customization.pupilSize} min={0} max={100} onChange={(v) => handleCustomizationChange('pupilSize', v)} />
            
            <h3 className="font-medium text-gray-900 mb-3 mt-6">眉毛</h3>
            <CustomSlider label="眉毛の高さ" value={customization.eyebrowHeight} min={0} max={100} onChange={(v) => handleCustomizationChange('eyebrowHeight', v)} />
            <CustomSlider label="眉毛の角度" value={customization.eyebrowAngle} min={-50} max={50} onChange={(v) => handleCustomizationChange('eyebrowAngle', v)} />
            <CustomSlider label="眉毛の太さ" value={customization.eyebrowThickness} min={0} max={100} onChange={(v) => handleCustomizationChange('eyebrowThickness', v)} />
            
            <h3 className="font-medium text-gray-900 mb-3 mt-6">鼻</h3>
            <CustomSlider label="鼻の大きさ" value={customization.noseSize} min={0} max={100} onChange={(v) => handleCustomizationChange('noseSize', v)} />
            <CustomSlider label="鼻の幅" value={customization.noseWidth} min={0} max={100} onChange={(v) => handleCustomizationChange('noseWidth', v)} />
            <CustomSlider label="鼻の高さ" value={customization.noseHeight} min={0} max={100} onChange={(v) => handleCustomizationChange('noseHeight', v)} />
            
            <h3 className="font-medium text-gray-900 mb-3 mt-6">口</h3>
            <CustomSlider label="口の大きさ" value={customization.mouthSize} min={0} max={100} onChange={(v) => handleCustomizationChange('mouthSize', v)} />
            <CustomSlider label="口の幅" value={customization.mouthWidth} min={0} max={100} onChange={(v) => handleCustomizationChange('mouthWidth', v)} />
            <CustomSlider label="唇の厚さ" value={customization.lipThickness} min={0} max={100} onChange={(v) => handleCustomizationChange('lipThickness', v)} />
            <CustomSlider label="口の位置" value={customization.mouthHeight} min={0} max={100} onChange={(v) => handleCustomizationChange('mouthHeight', v)} />
          </div>
        );
      
      case 'hair':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 mb-3">髪の形状</h3>
            <CustomSlider label="髪の長さ" value={customization.hairLength} min={0} max={100} onChange={(v) => handleCustomizationChange('hairLength', v)} />
            <CustomSlider label="髪のボリューム" value={customization.hairVolume} min={0} max={100} onChange={(v) => handleCustomizationChange('hairVolume', v)} />
            <CustomSlider label="カール度" value={customization.hairCurl} min={0} max={100} onChange={(v) => handleCustomizationChange('hairCurl', v)} />
            <CustomSlider label="前髪の長さ" value={customization.bangsLength} min={0} max={100} onChange={(v) => handleCustomizationChange('bangsLength', v)} />
            <CustomSlider label="サイドヘアの長さ" value={customization.sideHairLength} min={0} max={100} onChange={(v) => handleCustomizationChange('sideHairLength', v)} />
            
            <h3 className="font-medium text-gray-900 mb-3 mt-6">髪色</h3>
            <div className="space-y-3">
              <button
                onClick={() => setColorTarget('hair')}
                className={`w-full p-2 rounded-lg border-2 ${colorTarget === 'hair' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}
              >
                髪色を変更
              </button>
              {colorTarget === 'hair' && (
                <div className="space-y-3">
                  <HexColorPicker color={tempAvatar.hairColor} onChange={handleColorChange} />
                  <HexColorInput color={tempAvatar.hairColor} onChange={handleColorChange} />
                </div>
              )}
            </div>
          </div>
        );
      
      case 'body':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 mb-3">体型</h3>
            <CustomSlider label="身長" value={customization.heightScale} min={80} max={120} onChange={(v) => handleCustomizationChange('heightScale', v)} unit="%" />
            <CustomSlider label="肩幅" value={customization.shoulderWidth} min={0} max={100} onChange={(v) => handleCustomizationChange('shoulderWidth', v)} />
            <CustomSlider label="バスト" value={customization.bustSize} min={0} max={100} onChange={(v) => handleCustomizationChange('bustSize', v)} />
            <CustomSlider label="ウエスト" value={customization.waistSize} min={0} max={100} onChange={(v) => handleCustomizationChange('waistSize', v)} />
            <CustomSlider label="ヒップ" value={customization.hipSize} min={0} max={100} onChange={(v) => handleCustomizationChange('hipSize', v)} />
            <CustomSlider label="腕の太さ" value={customization.armThickness} min={0} max={100} onChange={(v) => handleCustomizationChange('armThickness', v)} />
            <CustomSlider label="脚の太さ" value={customization.legThickness} min={0} max={100} onChange={(v) => handleCustomizationChange('legThickness', v)} />
            
            <h3 className="font-medium text-gray-900 mb-3 mt-6">肌色</h3>
            <div className="space-y-3">
              <button
                onClick={() => setColorTarget('skin')}
                className={`w-full p-2 rounded-lg border-2 ${colorTarget === 'skin' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}
              >
                肌色を変更
              </button>
              {colorTarget === 'skin' && (
                <div className="space-y-3">
                  <HexColorPicker color={tempAvatar.skinTone} onChange={handleColorChange} />
                  <HexColorInput color={tempAvatar.skinTone} onChange={handleColorChange} />
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return <div>開発中...</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[95vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <Sliders className="mr-2" size={24} />
            VRoid スタジオ風キャラメイク
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="リセット"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="エクスポート"
            >
              <Download size={20} />
            </button>
            <label className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors cursor-pointer" title="インポート">
              <Upload size={20} />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-140px)]">
          {/* 左側：プレビュー */}
          <div className="w-1/2 bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex flex-col">
            {/* プレビューエリア */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <VRMAvatar 
                  avatar={tempAvatar} 
                  size="xlarge" 
                  mood={50}
                  emotionState="normal"
                />
                
                {/* 回転コントロール */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={previewRotation}
                    onChange={(e) => setPreviewRotation(Number(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>
            </div>
            
            {/* プリセット */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">プリセット</h3>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右側：コントロール */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            {/* カテゴリタブ */}
            <div className="flex bg-white border-b">
              {[
                { id: 'face' as CustomCategory, label: '顔', icon: User },
                { id: 'hair' as CustomCategory, label: '髪', icon: Palette },
                { id: 'body' as CustomCategory, label: '体型', icon: User },
                { id: 'outfit' as CustomCategory, label: '服装', icon: Shirt },
                { id: 'accessories' as CustomCategory, label: 'アクセ', icon: Eye },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 transition-colors ${
                    activeCategory === id
                      ? 'bg-white border-b-2 border-purple-500 text-purple-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* スクロール可能なコントロールエリア */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderCategoryControls()}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="bg-gray-100 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            ※ より詳細な調整が可能です。スライダーで細かく調整してください。
          </div>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center"
            >
              <Save className="mr-2" size={18} />
              保存して適用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};