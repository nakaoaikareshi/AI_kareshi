'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AvatarSettings } from '@/types';

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
  const appRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // サイズ設定
  const dimensions = {
    small: { width: 100, height: 100 },
    medium: { width: 200, height: 200 },
    large: { width: 400, height: 400 },
  };

  const { width, height } = dimensions[size];

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    const initLive2D = async () => {
      try {
        setIsLoading(true);
        
        // 動的にPIXIとLive2Dをインポート
        const PIXI = await import('pixi.js');
        const { Live2DModel } = await import('pixi-live2d-display');
        
        // グローバルPIXIを設定
        (window as any).PIXI = PIXI;

        // PIXI Application作成
        const app = new PIXI.Application({
          view: canvasRef.current!,
          width,
          height,
          backgroundColor: 0x000000,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        });
        
        appRef.current = app;

        // Live2Dモデルのロード
        // 注意: 実際のLive2Dモデルファイル（.model3.json）が必要
        // ここではデモ用の無料モデルを使用
        const modelUrl = '/models/live2d/hiyori/hiyori.model3.json';
        
        try {
          const model = await Live2DModel.from(modelUrl);
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
  }, [width, height]); // 基本的な依存関係のみ

  // 感情表現の適用
  const applyEmotion = (model: any, emotion: string) => {
    if (!model || !model.internalModel) return;

    // Live2Dモデルの表情切り替え
    // モデルに応じた表情IDを設定
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
  };

  // 口パク開始
  const startLipSync = (model: any) => {
    if (!model) return;
    
    // 音声に合わせた口パク（簡易版）
    const lipSyncInterval = setInterval(() => {
      const value = Math.random();
      if (model.internalModel && model.internalModel.coreModel) {
        model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', value);
      }
    }, 100);

    // インターバルIDを保存（後でクリア用）
    model.lipSyncInterval = lipSyncInterval;
  };

  // 口パク停止
  const stopLipSync = (model: any) => {
    if (!model) return;
    
    if (model.lipSyncInterval) {
      clearInterval(model.lipSyncInterval);
      if (model.internalModel && model.internalModel.coreModel) {
        model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0);
      }
      model.lipSyncInterval = null;
    }
  };

  // 話している状態の変更を監視
  useEffect(() => {
    if (!modelRef.current) return;
    
    if (isSpeaking) {
      startLipSync(modelRef.current);
    } else {
      stopLipSync(modelRef.current);
    }
  }, [isSpeaking]);

  // 感情状態の変更を監視
  useEffect(() => {
    if (!modelRef.current) return;
    applyEmotion(modelRef.current, emotionState);
  }, [emotionState]);

  // エラー時のフォールバック
  if (error) {
    // FantasyAvatarコンポーネントを動的インポート
    const [FallbackAvatar, setFallbackAvatar] = useState<React.ComponentType<any> | null>(null);
    
    useEffect(() => {
      import('./FantasyAvatar').then(module => {
        setFallbackAvatar(() => module.FantasyAvatar);
      });
    }, []);

    if (FallbackAvatar) {
      return <FallbackAvatar avatar={avatar} size={size} mood={mood} isSpeaking={isSpeaking} isBlinking={isBlinking} emotionState={emotionState} />;
    }
    
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-xs text-gray-500">アバター読み込みエラー</p>
      </div>
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