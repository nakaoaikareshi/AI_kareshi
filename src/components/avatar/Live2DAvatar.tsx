'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AvatarSettings } from '@/types';
import { FantasyAvatar } from './FantasyAvatar';

interface Live2DModel {
  width: number;
  height: number;
  scale: { set: (scale: number) => void };
  position: { set: (x: number, y: number) => void };
  autoUpdate: boolean;
  internalModel?: {
    eyeBlink?: boolean;
    coreModel?: {
      setParameterValueById: (id: string, value: number) => void;
    };
  };
  expression?: (id: string) => void;
  lipSyncInterval?: NodeJS.Timeout;
}

interface PIXIApplication {
  view: HTMLCanvasElement;
  stage: {
    addChild: (child: Live2DModel) => void;
  };
  destroy: (removeView: boolean, options: Record<string, boolean>) => void;
}

interface Live2DAvatarProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  mood?: number;
  isSpeaking?: boolean;
  isBlinking?: boolean;
  emotionState?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised' | 'love';
}

export const Live2DAvatar: React.FC<Live2DAvatarProps> = ({
  avatar,
  size = 'medium',
  mood = 50,
  isSpeaking = false,
  isBlinking = true,
  emotionState = 'normal',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXIApplication | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // サイズ設定
  const dimensions = {
    small: { width: 100, height: 100 },
    medium: { width: 200, height: 200 },
    large: { width: 400, height: 400 },
  };

  const { width, height } = dimensions[size];

  // 感情表現の適用
  const applyEmotion = useCallback((model: Live2DModel, emotion: string) => {
    if (!model || !model.internalModel) return;

    const expressionMap: Record<string, string> = {
      normal: 'neutral',
      happy: 'smile',
      sad: 'sad',
      angry: 'angry',
      surprised: 'surprised',
      love: 'love',
    };

    const expressionId = expressionMap[emotion] || 'neutral';
    
    try {
      if (model.expression) {
        model.expression(expressionId);
      }
    } catch (err) {
      console.warn('表情の設定に失敗:', err);
    }
  }, []);

  // 口パク開始
  const startLipSync = useCallback((model: Live2DModel) => {
    if (!model) return;
    
    const lipSyncInterval = setInterval(() => {
      const value = Math.random();
      if (model.internalModel?.coreModel) {
        model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', value);
      }
    }, 100);

    model.lipSyncInterval = lipSyncInterval;
  }, []);

  // 口パク停止
  const stopLipSync = useCallback((model: Live2DModel) => {
    if (!model) return;
    
    if (model.lipSyncInterval) {
      clearInterval(model.lipSyncInterval);
      if (model.internalModel?.coreModel) {
        model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0);
      }
      model.lipSyncInterval = undefined;
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    const initLive2D = async () => {
      try {
        setIsLoading(true);
        
        // 動的にPIXIとLive2Dをインポート
        const PIXI = await import('pixi.js');
        const { Live2DModel: ImportedLive2DModel } = await import('pixi-live2d-display');
        
        // グローバルPIXIを設定
        (window as typeof window & { PIXI: typeof PIXI }).PIXI = PIXI;

        // PIXI Application作成
        const app = new PIXI.Application({
          view: canvasRef.current!,
          width,
          height,
          backgroundColor: 0x000000,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        }) as unknown as PIXIApplication;
        
        appRef.current = app;

        // Live2Dモデルのロード
        const modelUrl = '/models/live2d/hiyori/hiyori.model3.json';
        
        try {
          const model = await ImportedLive2DModel.from(modelUrl) as unknown as Live2DModel;
          modelRef.current = model;

          // モデルのスケールと位置調整
          const scale = Math.min(width / model.width, height / model.height);
          model.scale.set(scale);
          model.position.set(width / 2, height / 2);
          
          // モデルをステージに追加
          app.stage.addChild(model);

          // アニメーション設定
          model.autoUpdate = true;
          
          // まばたき設定
          if (isBlinking && model.internalModel) {
            model.internalModel.eyeBlink = true;
          }

          // 感情表現
          applyEmotion(model, emotionState);
          
          // 口パク設定
          if (isSpeaking) {
            startLipSync(model);
          } else {
            stopLipSync(model);
          }

          setIsLoading(false);
          setError(null);
        } catch (modelError) {
          console.error('Live2Dモデルのロードに失敗:', modelError);
          setError('Live2Dモデルのロードに失敗しました。FantasyAvatarを使用します。');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Live2D初期化エラー:', err);
        setError('Live2Dの初期化に失敗しました。FantasyAvatarを使用します。');
        setIsLoading(false);
      }
    };

    initLive2D();

    // クリーンアップ
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
      modelRef.current = null;
    };
    // 依存関係を最小限に
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // 話している状態の変更を監視
  useEffect(() => {
    if (!modelRef.current) return;
    
    if (isSpeaking) {
      startLipSync(modelRef.current);
    } else {
      stopLipSync(modelRef.current);
    }
  }, [isSpeaking, startLipSync, stopLipSync]);

  // 感情状態の変更を監視
  useEffect(() => {
    if (!modelRef.current) return;
    applyEmotion(modelRef.current, emotionState);
  }, [emotionState, applyEmotion]);

  // エラー時のフォールバック
  if (error) {
    return (
      <FantasyAvatar 
        avatar={avatar} 
        size={size} 
        mood={mood} 
        isSpeaking={isSpeaking} 
        isBlinking={isBlinking} 
        emotionState={emotionState} 
      />
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">読み込み中...</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        style={{ display: 'block' }}
      />
    </div>
  );
};